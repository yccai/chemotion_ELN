import React from 'react';
import {Label, Pagination, Table, Input} from 'react-bootstrap';

import UIStore from './stores/UIStore';
import UIActions from './actions/UIActions';
import ElementActions from './actions/ElementActions';

import ElementStore from './stores/ElementStore';
import ElementAllCheckbox from './ElementAllCheckbox';
import ElementsTableEntries from './ElementsTableEntries';
import ElementsSvgCheckbox from './ElementsSvgCheckbox';

import deepEqual from 'deep-equal';

export default class ElementsTable extends React.Component {
  constructor(props) {
    super(props);

    const currentUIState = UIStore.getState();
    const currentElementTypeState = ElementStore.getState().elements[props.type];

    this.state = {
      elements: currentElementTypeState.elements,
      page: currentElementTypeState.page,
      perPage: currentElementTypeState.perPage,
      totalElements: currentElementTypeState.totalElements,
      pages: currentElementTypeState.pages,
      currentElement: null,
      ui: {
        checkedIds: currentUIState[props.type].checkedIds,
        uncheckedIds: currentUIState[props.type].uncheckedIds,
        checkedAll: currentUIState[props.type].checkedAll,
        currentId: currentUIState[props.type].currentId,
        showPreviews: currentUIState.showPreviews,
        numberOfResults: currentUIState.numberOfResults,
      }
    }
  }

  componentDidMount() {
    UIStore.getState();
    ElementStore.listen(this.onChange.bind(this));
    UIStore.listen(this.onChangeUI.bind(this));
    this.initializePagination();
  }

  componentWillUnmount() {
    ElementStore.unlisten(this.onChange.bind(this));
    UIStore.unlisten(this.onChangeUI.bind(this));
  }

  initializePagination() {
    const type = this.props.type;
    const {page, pages, perPage, totalElements} = this.state;

    this.setState({
      page, pages, perPage, totalElements
    });
  }

  onChangeUI(state) {
    let {checkedIds, uncheckedIds, checkedAll} = state[this.props.type];

    // check if element details of any type are open at the moment
    let currentId = state.sample.currentId || state.reaction.currentId || state.wellplate.currentId;

    if (checkedIds || uncheckedIds || checkedAll || currentId || state.showPreviews) {
      this.setState({
        ui: {
          checkedIds: checkedIds,
          uncheckedIds: uncheckedIds,
          checkedAll: checkedAll,
          currentId: currentId,
          showPreviews: state.showPreviews,
          numberOfResults: state.numberOfResults
        }
      });
    }
  }

  onChange(state) {
    const {type} = this.props;
    let elementsState = state.elements[type];

    const {elements, page, pages, perPage, totalElements} = elementsState;

    let currentElement;
    if(!state.currentElement || state.currentElement.type == this.props.type) {
      currentElement = state.currentElement
    }

    let elementsDidChange = elements && ! deepEqual(elements, this.state.elements);
    let currentElementDidChange = ! deepEqual(currentElement, this.state.currentElement);

    if (elementsDidChange) {
      this.setState({
        elements, page, pages, perPage, totalElements, currentElement
      }),
      () => this.initializePagination()
    }
    else if (currentElementDidChange) {
      this.setState({
        page, pages, perPage, totalElements, currentElement
      }),
      () => this.initializePagination()
    }
  }

  handlePaginationSelect(event, selectedEvent) {
    const {pages} = this.state;
    const {type} = this.props;
    if(selectedEvent.eventKey > 0 && selectedEvent.eventKey <= pages) {
      this.setState({
        page: selectedEvent.eventKey
      }, () => UIActions.setPagination({type, page: this.state.page}));
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

  previewCheckbox() {
    const {ui} = this.state;
    const {type} = this.props;
    if(type == 'sample' || type == 'reaction' ) {
      return <ElementsSvgCheckbox checked={ui.showPreviews}/>
    }
  }

  handleNumberOfResultsChange(event) {
    const value = event.target.value;
    const {type} = this.props;
    UIActions.changeNumberOfResultsShown({
      value: value
    });
    ElementActions.refreshElements({
      type: type,
      moleculeName: null
    });
  }

  numberOfResultsDropdown() {
    let {ui} = this.state;
    return (
      <Input className="number-shown-select" onChange={event => this.handleNumberOfResultsChange(event)} label="Show:" type="text" bsSize="small" value={ui.numberOfResults} />
    );
  }

  render() {
    const {elements, ui, currentElement} = this.state;
    const {overview, type} = this.props;

    return (
      <div>
        <Table className="elements" bordered hover>
          <thead>
            <th className="check">
              <ElementAllCheckbox type={type} checked={ui.checkedAll}/>
            </th>
            <th colSpan={3}>
              All {type}s
            </th>
          </thead>
          <ElementsTableEntries elements={elements} currentElement={currentElement} showDragColumn={!overview} ui={ui}/>
        </Table>
        <table width="100%">
          <tr>
            <td width="70%">{this.pagination()}</td>
            <td width="30%">{this.numberOfResultsDropdown()}</td>
          </tr>
        </table>
        {this.previewCheckbox()}
      </div>
    );
  }
}
