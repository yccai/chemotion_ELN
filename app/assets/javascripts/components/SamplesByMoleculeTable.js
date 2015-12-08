import React from 'react';
import {Label, Pagination, Table, Input} from 'react-bootstrap';
import UIStore from './stores/UIStore';
import UIActions from './actions/UIActions';
import ElementActions from './actions/ElementActions';
import ElementStore from './stores/ElementStore';
import SamplesByMoleculeTableEntries from './SamplesByMoleculeTableEntries';
import deepEqual from 'deep-equal';

export default class SamplesByMoleculeTable extends React.Component {
  constructor(props) {
    super(props);

    // TODO proper initialization
    this.state = {
      elements: [],
      currentElement: null,
      type: 'sample',
      moleculeName: props.moleculeName,
      ui: {
        numberOfResults: props.perPage
      }
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

  setPagination(state) {
    const {page, pages, perPage, totalElements} = state;

    this.setState({
      page, pages, perPage, totalElements
    });
  }

  onChangeUI(state) {
    const {type, moleculeName} = this.state;
    let {checkedIds, uncheckedIds, checkedAll} = state[type];

    // check if element details of any type are open at the moment
    let currentId = state.sample.currentId || state.reaction.currentId || state.wellplate.currentId;
    let numberOfResults = state[moleculeName] && state[moleculeName].numberOfResults;

    if (checkedIds || uncheckedIds || checkedAll || currentId) {
      this.setState({
        ui: {
          checkedIds: checkedIds,
          uncheckedIds: uncheckedIds,
          checkedAll: checkedAll,
          currentId: currentId,
          numberOfResults: numberOfResults
        }
      });
    }
  }

  onChange(state) {
    const {moleculeName, type} = this.state;
    let elementsState = state.elements[moleculeName];

    const {elements, page, pages, perPage, totalElements} = elementsState;

    let currentElement;
    if(!state.currentElement || state.currentElement.type == type) {
      currentElement = state.currentElement
    }

    let elementsDidChange = elements && ! deepEqual(elements, this.state.elements);
    let currentElementDidChange = ! deepEqual(currentElement, this.state.currentElement);

    if (elementsDidChange) {
      this.setState({
        elements, page, pages, perPage, totalElements, currentElement
      })
    }
    else if (currentElementDidChange) {
      this.setState({
        page, pages, perPage, totalElements, currentElement
      })
    }
  }

  handlePaginationSelect(event, selectedEvent) {
    const {pages, type, moleculeName} = this.state;

    if(selectedEvent.eventKey > 0 && selectedEvent.eventKey <= pages) {
      this.setState({
        page: selectedEvent.eventKey
      }, () => UIActions.setPagination({
        type: type,
        moleculeName: moleculeName,
        page: this.state.page
      }));
    }
  }

  pagination() {
    const {page, pages} = this.state;
    if(pages > 1) {
      return <Pagination
        prev
        next
        first
        last
        maxButtons={10}
        activePage={page}
        items={pages}
        bsSize="small"
        onSelect={(event, selectedEvent) => this.handlePaginationSelect(event, selectedEvent)}/>
    }
  }

  handleNumberOfResultsChange(event) {
    const value = event.target.value;
    const {type, moleculeName} = this.state;

    // TODO spezialfall für molecule container
    UIActions.changeNumberOfResultsShown({
      value: value,
      moleculeName: moleculeName
    });
    ElementActions.refreshElements({
      type: type,
      moleculeName: moleculeName
    });
  }

  numberOfResultsInput() {
    let {ui} = this.state;
    return (
      <Input className="number-shown-select" onChange={event => this.handleNumberOfResultsChange(event)} label="Show:" type="text" bsSize="small" value={ui.numberOfResults} />
    );
  }

  render() {
    const {elements, ui, currentElement} = this.state;
    const {overview} = this.props;

    return (
      <div>
        <Table className="elements" bordered hover>
          <SamplesByMoleculeTableEntries
            elements={elements}
            currentElement={currentElement}
            showDragColumn={!overview}
            ui={ui}/>
        </Table>
        <table width="100%">
          <tr>
            <td width="70%">{this.pagination()}</td>
            <td width="30%">{this.numberOfResultsInput()}</td>
          </tr>
        </table>
      </div>
    );
  }
}
