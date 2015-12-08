import React from 'react';
import ElementsTable from './ElementsTable';
import {Input, TabbedArea, TabPane} from 'react-bootstrap';
import ElementStore from './stores/ElementStore';
import UIStore from './stores/UIStore';
import UIActions from './actions/UIActions';
import MoleculeContainerView from './MoleculeContainerView';

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      totalSampleElements: 0,
      totalReactionElements: 0,
      totalWellplateElements: 0,
      totalScreenElements: 0,
      currentTab: 1,
      withMoleculeContainer: false
    }
  }

  _checkedElements(type) {
    let elementUI = UIStore.getState()[type];
    let element   = ElementStore.getState()['elements'][type];
    if (elementUI.checkedAll) {
      return element.totalElements - elementUI.uncheckedIds.size;
    } else {
      return elementUI.checkedIds.size;
    }
  }

  componentDidMount() {
    ElementStore.listen(this.onChange.bind(this));
    UIStore.listen(this.onChangeUI.bind(this));
  }

  componentWillUnmount() {
    ElementStore.unlisten(this.onChange.bind(this));
    UIStore.unlisten(this.onChangeUI.bind(this));
  }

  onChange(state) {
    this.setState({
      totalSampleElements: state.elements.sample.totalElements,
      totalReactionElements: state.elements.reaction.totalElements,
      totalWellplateElements: state.elements.wellplate.totalElements,
      totalScreenElements: state.elements.screen.totalElements
    });
  }

  onChangeUI(state) {
    this.setState({
      currentTab: state.currentTab
    });
  }

  handleTabSelect(tab) {
    UIActions.selectTab(tab);

    // TODO sollte in tab action handler
    let type;

    switch(tab) {
      case 1:
        type = 'sample';
        break;
      case 2:
        type = 'reaction';
        break;
      case 3:
        type = 'wellplate';
        break;
      case 4:
        type = 'screen';
    }

    let uiState = UIStore.getState();
    let page = uiState[type].page;

    UIActions.setPagination({type: type, page: page})
  }

  moleculeContainerCheckbox() {
    return (
      <Input type='checkbox'
             label='With molecule container'
             checked={this.state.withMoleculeContainer}
             onChange={() => this.handleMoleculeContainerChange()}/>
    )
  }

  handleMoleculeContainerChange() {
    const { withMoleculeContainer } = this.state;
    this.setState({
      withMoleculeContainer: !withMoleculeContainer
    });
  }

  sampleTable() {
    if(this.state.withMoleculeContainer) {
      return (
        <div>
          <MoleculeContainerView />
          {this.moleculeContainerCheckbox()}
        </div>
      )
    } else {
      return (
        <div>
          <ElementsTable overview={this.props.overview} type='sample' />
          {this.moleculeContainerCheckbox()}
        </div>
      )
    }
  }

  render() {
    const {overview} = this.props;
    let samples =
      <i className="icon-sample">
         {this.state.totalSampleElements} ({this._checkedElements('sample')})
      </i>;
    let reactions =
      <i className="icon-reaction">
         {this.state.totalReactionElements} ({this._checkedElements('reaction')})
      </i>;
    let wellplates =
      <i className="icon-wellplate">
         {this.state.totalWellplateElements} ({this._checkedElements('wellplate')})
      </i>;
    let screens =
      <i className="icon-screen">
        {" " + this.state.totalScreenElements} ({this._checkedElements('screen')})
      </i>;

    return (
      <TabbedArea defaultActiveKey={this.state.currentTab} activeKey={this.state.currentTab}
                  onSelect={(e) => this.handleTabSelect(e)}>
        <TabPane eventKey={1} tab={samples}>
          {this.sampleTable()}
        </TabPane>
        <TabPane eventKey={2} tab={reactions}>
          <ElementsTable overview={overview} type='reaction'/>
        </TabPane>
        <TabPane eventKey={3} tab={wellplates}>
          <ElementsTable overview={overview} type='wellplate'/>
        </TabPane>
        <TabPane eventKey={4} tab={screens}>
          <ElementsTable overview={overview} type='screen'/>
        </TabPane>
      </TabbedArea>
    )
  }
}
