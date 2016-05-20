import React from 'react';
import {Button} from 'react-bootstrap';

import UIStore from './stores/UIStore';
import UIActions from './actions/UIActions';
import ElementStore from './stores/ElementStore';
import ElementActions from './actions/ElementActions';
import CollectionActions from './actions/CollectionActions';

import Aviator from 'aviator';

export default class CollectionSubtree extends React.Component {
  constructor(props) {
    super(props);

    let state = UIStore.getState();
    let {currentCollection} = state;

    this.state = {
      isRemote: props.isRemote,
      label: props.root.label,
      selected: currentCollection && currentCollection.id == props.root.id,
      root: this.props.root,
      visible: this.isVisible(this.props.root, state)
    }
  }

  isVisible(node, uiState) {
    if(node.descendant_ids) {
      return node.descendant_ids.indexOf(parseInt(uiState.currentCollection.id)) > -1;
    } else {
      return false;
    }
  }

  componentDidMount() {
    UIStore.listen(this.onChange.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      root: nextProps.root,
      label: nextProps.root.label
    });
  }

  componentWillUnmount() {
    console.log('componentWillUnmount called')
    UIStore.unlisten(this.onChange.bind(this));
  }

  onChange(state) {
    if(state.currentCollection) {
      let visible = this.isVisible(this.state.root, state);
      console.log('visible?')
      console.log(visible)

      if(state.currentCollection.id == this.state.root.id) {
        this.setState({
          selected: true,
          visible: visible
        });
      } else {
        this.setState({
          selected: false,
          visible: visible
        });
      }
    }
  }

  selectedCssClass() {
    return this.state.selected ? "selected" : "";
  }

  children() {
    return this.state.root.children || [];
  }

  hasChildren() {
    return this.children().length > 0;
  }

  subtreesWrapper() {
    if(this.state.visible)
      return (
        <ul>
          {this.subtrees()}
        </ul>
      )
    else
      return null;
  }

  subtrees() {
    let children = this.children();

    if(this.hasChildren()) {
      return children.map((child, index) => {
        return (
          <li key={index}>
            <CollectionSubtree root={child} isRemote={this.state.isRemote} />
          </li>
        )
      })
    } else {
      return null;
    }
  }


  expandButton() {
    let label = this.state.visible ? '-' : '+';

    if(this.hasChildren()) {
      return (
        <Button bsStyle="success" bsSize="xsmall" onClick={this.toggleExpansion.bind(this)}>
          {label}
        </Button>
      )
    }
  }

  takeOwnershipButton() {
    let isRemote = this.state.isRemote;
    let isTakeOwnershipAllowed = this.state.root.permission_level == 5;

    if(isRemote && isTakeOwnershipAllowed) {
      return (
        <div className="take-ownership-btn">
          <Button bsStyle="danger" bsSize="xsmall" onClick={(e) => this.handleTakeOwnership()}>
            <i className="fa fa-exchange"></i>
          </Button>
        </div>
      )
    }
  }

  handleTakeOwnership() {
    CollectionActions.takeOwnership({id: this.state.root.id});
  }

  handleClick() {
    const { root } = this.state;

    if(root.label == 'All') {
      Aviator.navigate(`/collection/all/${this.urlForCurrentElement()}`);
    } else {
      Aviator.navigate(`/collection/${this.state.root.id}/${this.urlForCurrentElement()}`);
    }
  }

  urlForCurrentElement() {
    const {currentElement} = ElementStore.getState();
    if(currentElement) {
      if(currentElement.isNew) {
        return `${currentElement.type}/new`;
      }
      else{
        return `${currentElement.type}/${currentElement.id}`;
      }
    }
    else {
      return '';
    }
  }

  toggleExpansion(e) {
    e.stopPropagation();
    this.setState({visible: !this.state.visible});
  }

  render() {
    return (
      <div className="tree-view" key={this.state.root.id}>
        {this.takeOwnershipButton()}
        <div className={"title " + this.selectedCssClass()} onClick={this.handleClick.bind(this)}>
          {this.expandButton()}
          {this.state.label}
        </div>
        {this.subtreesWrapper()}
      </div>
    )
  }
}
