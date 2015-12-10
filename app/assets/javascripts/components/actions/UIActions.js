import alt from '../alt';

// An element object has a type and an id, e.g., {type: 'sample', id: 1}
class UIActions {
  showCollectionManagement() {
    this.dispatch();
  }

  toggleCollectionManagement() {
    this.dispatch();
  }

  showElements() {
    this.dispatch();
  }

  selectTab(tab) {
    this.dispatch(tab);
  }

  selectCollection(collection) {
    this.dispatch(collection)
  }

  checkAllElements(type) {
    this.dispatch(type);
  }

  toggleShowPreviews() {
    this.dispatch();
  }

  checkElement(element) {
    this.dispatch(element);
  }

  uncheckAllElements(type) {
    this.dispatch(type);
  }

  uncheckWholeSelection() {
    this.dispatch();
  }

  uncheckElement(element) {
    this.dispatch(element);
  }

  selectElement(element) {
    this.dispatch(element);
  }

  deselectAllElementsOfType(type) {
    this.dispatch(type);
  }

  deselectAllElements() {
    this.dispatch();
  }

  setPagination(pagination) {
    this.dispatch(pagination);
  }

  setSearchSelection(selection) {
    this.dispatch(selection);
  }

  selectCollectionWithoutUpdating(collection) {
    this.dispatch(collection);
  }

  clearSearchSelection() {
    this.dispatch();
  }

  changeNumberOfResultsShown(params) {
    this.dispatch(params);
  }
}

export default alt.createActions(UIActions);
