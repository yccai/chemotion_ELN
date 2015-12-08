import alt from '../alt';
import ElementActions from '../actions/ElementActions';
import UIActions from '../actions/UIActions';
import UserActions from '../actions/UserActions';
import UIStore from './UIStore';
import ClipboardStore from './ClipboardStore';

import Sample from '../models/Sample';
import Reaction from '../models/Reaction';
import Wellplate from '../models/Wellplate';
import Screen from '../models/Screen';

class ElementStore {
  constructor() {
    // TODO cleanup
    this.state = {
      elements: {
        sample: {
          elements: [],
          totalElements: 0,
          page: null,
          pages: null,
          perPage: null
        },
        reaction: {
          elements: [],
          totalElements: 0,
          page: null,
          pages: null,
          perPage: null
        },
        wellplate: {
          elements: [],
          totalElements: 0,
          page: null,
          pages: null,
          perPage: null
        },
        screen: {
          elements: [],
          totalElements: 0,
          page: null,
          pages: null,
          perPage: null
        }
      },
      currentElement: null,
      currentReaction: null,
      currentMaterialGroup: null,
      moleculeNames: []
    };

    this.bindListeners({
      handleFetchBasedOnSearchSelection: ElementActions.fetchBasedOnSearchSelectionAndCollection,
      handleFetchSampleById: ElementActions.fetchSampleById,
      handleFetchSamplesByCollectionId: ElementActions.fetchSamplesByCollectionId,
      handleUpdateSample: ElementActions.updateSample,
      handleCreateSample: ElementActions.createSample,
      handleCopySampleFromClipboard: ElementActions.copySampleFromClipboard,
      handleAddSampleToMaterialGroup: ElementActions.addSampleToMaterialGroup,
      handleImportSamplesFromFile: ElementActions.importSamplesFromFile,
      handleFetchMoleculeNames: ElementActions.fetchMoleculeNames,
      handleFetchSamplesByMoleculeName: ElementActions.fetchSamplesByMoleculeName,

      handleFetchReactionById: ElementActions.fetchReactionById,
      handleFetchReactionsByCollectionId: ElementActions.fetchReactionsByCollectionId,
      handleUpdateReaction: ElementActions.updateReaction,
      handleCreateReaction: ElementActions.createReaction,
      handleCopyReactionFromId: ElementActions.copyReactionFromId,
      handleFetchReactionSvgByMaterialsInchikeys: ElementActions.fetchReactionSvgByMaterialsInchikeys,
      handleFetchReactionSvgByReactionId: ElementActions.fetchReactionSvgByReactionId,
      handleOpenReactionDetails: ElementActions.openReactionDetails,

      handleBulkCreateWellplatesFromSamples: ElementActions.bulkCreateWellplatesFromSamples,
      handleFetchWellplateById: ElementActions.fetchWellplateById,
      handleFetchWellplatesByCollectionId: ElementActions.fetchWellplatesByCollectionId,
      handleUpdateWellplate: ElementActions.updateWellplate,
      handleCreateWellplate: ElementActions.createWellplate,
      handleGenerateWellplateFromClipboard: ElementActions.generateWellplateFromClipboard,
      handleGenerateScreenFromClipboard: ElementActions.generateScreenFromClipboard,

      handleFetchScreenById: ElementActions.fetchScreenById,
      handleFetchScreensByCollectionId: ElementActions.fetchScreensByCollectionId,
      handleUpdateScreen: ElementActions.updateScreen,
      handleCreateScreen: ElementActions.createScreen,

      handleUnselectCurrentElement: UIActions.deselectAllElements,
      // FIXME ElementStore listens to UIActions?
      handleSetPagination: UIActions.setPagination,
      handleRefreshElements: ElementActions.refreshElements,
      handleGenerateEmptyElement: [ElementActions.generateEmptyWellplate, ElementActions.generateEmptyScreen, ElementActions.generateEmptySample, ElementActions.generateEmptyReaction],
      handleFetchMoleculeByMolfile: ElementActions.fetchMoleculeByMolfile,
      handleDeleteElements: ElementActions.deleteElements,

      handleUpdateElementsCollection: ElementActions.updateElementsCollection,
      handleAssignElementsCollection: ElementActions.assignElementsCollection,
      handleRemoveElementsCollection: ElementActions.removeElementsCollection,
      handleSplitAsSubsamples: ElementActions.splitAsSubsamples
    })
  }

  handleFetchBasedOnSearchSelection(result) {
    Object.keys(result).forEach((key) => {
      this.state.elements[key] = result[key];
    });
  }

  closeElementWhenDeleted(ui_state) {
    let currentElement = this.state.currentElement;
    if (currentElement) {
      let type_state = ui_state[currentElement.type]
      let checked = type_state.checkedIds.indexOf(currentElement.id) > -1
      let checked_all_and_not_unchecked =
        type_state.checkedAll && type_state.uncheckedIds.indexOf(currentElement.id) == -1

      if (checked_all_and_not_unchecked || checked) {
        this.state.currentElement = null;
      }
    }
  }

  // -- Elements --
  handleDeleteElements(options) {
    const ui_state = UIStore.getState();

    ElementActions.deleteSamplesByUIState(ui_state);
    ElementActions.deleteReactionsByUIState({
      ui_state,
      options
    });
    ElementActions.deleteWellplatesByUIState(ui_state);
    ElementActions.deleteScreensByUIState(ui_state);
    ElementActions.fetchSamplesByCollectionId(ui_state.currentCollection.id);
    ElementActions.fetchReactionsByCollectionId(ui_state.currentCollection.id);
    ElementActions.fetchWellplatesByCollectionId(ui_state.currentCollection.id);
    ElementActions.fetchScreensByCollectionId(ui_state.currentCollection.id);
    this.closeElementWhenDeleted(ui_state);
  }

  handleUpdateElementsCollection(params) {
    let collection_id = params.ui_state.currentCollection.id
    ElementActions.fetchSamplesByCollectionId(collection_id);
    ElementActions.fetchReactionsByCollectionId(collection_id);
    ElementActions.fetchWellplatesByCollectionId(collection_id);
  }

  handleAssignElementsCollection(params) {
    let collection_id = params.ui_state.currentCollection.id
    ElementActions.fetchSamplesByCollectionId(collection_id);
    ElementActions.fetchReactionsByCollectionId(collection_id);
    ElementActions.fetchWellplatesByCollectionId(collection_id);
  }

  handleRemoveElementsCollection(params) {
    let collection_id = params.ui_state.currentCollection.id
    ElementActions.fetchSamplesByCollectionId(collection_id);
    ElementActions.fetchReactionsByCollectionId(collection_id);
    ElementActions.fetchWellplatesByCollectionId(collection_id);
  }

  // -- Samples --
  handleFetchSamplesByMoleculeName(resultAndMoleculeName) {
    const {result, moleculeName} = resultAndMoleculeName;
    this.state.elements[moleculeName] = result;
    this.state.currentMoleculeName = moleculeName;
  }

  handleFetchMoleculeNames(result) {
    this.state.moleculeNames = result.names;
  }

  handleFetchSampleById(result) {
    this.state.currentElement = result;
  }

  handleFetchSamplesByCollectionId(result) {
    this.state.elements.sample = result;
  }

  handleUpdateSample(sample) {
    this.state.currentElement = sample;
    this.handleRefreshElements({type: 'sample'});
  }

  handleCreateSample(sample) {
    UserActions.fetchCurrentUser();

    this.handleRefreshElements({type: 'sample'});
    this.navigateToNewElement(sample);
  }

  handleSplitAsSubsamples(ui_state) {
    ElementActions.fetchSamplesByCollectionId(ui_state.currentCollection.id);
  }

  // Molecules
  handleFetchMoleculeByMolfile(result) {
    // Attention: This is intended to update SampleDetails
    this.state.currentElement.molecule = result;
    this.handleRefreshElements({type: 'sample'});
  }

  handleCopySampleFromClipboard(collection_id) {
    let clipboardSamples = ClipboardStore.getState().samples;

    this.state.currentElement = Sample.copyFromSampleAndCollectionId(clipboardSamples[0], collection_id)
  }

  /**
   * @param {Object} params = { reaction, materialGroup }
   */
  handleAddSampleToMaterialGroup(params) {
    const { reaction, materialGroup } = params;
    const { temporary_sample_counter } = reaction;

    let sample = Sample.buildEmptyWithCounter(reaction.collection_id, temporary_sample_counter);

    this.state.currentMaterialGroup = materialGroup;
    this.state.currentReaction = reaction;
    this.state.currentElement = sample;
  }

  handleImportSamplesFromFile(result) {
    this.handleRefreshElements({type: 'sample'});
  }

  // -- Wellplates --

  handleBulkCreateWellplatesFromSamples() {
    this.handleRefreshElements({type: 'wellplate'});
    this.handleRefreshElements({type: 'sample'});
  }

  handleFetchWellplateById(result) {
    this.state.currentElement = result;
  }

  handleFetchWellplatesByCollectionId(result) {
    this.state.elements.wellplate = result;
  }

  handleUpdateWellplate(wellplate) {
    this.state.currentElement = wellplate;
    this.handleRefreshElements({type: 'wellplate'});
    this.handleRefreshElements({type: 'sample'});
  }

  handleCreateWellplate(wellplate) {
    this.handleRefreshElements({type: 'wellplate'});
    this.navigateToNewElement(wellplate);
  }

  handleGenerateWellplateFromClipboard(collection_id) {
    let clipboardSamples = ClipboardStore.getState().samples;

    this.state.currentElement = Wellplate.buildFromSamplesAndCollectionId(clipboardSamples, collection_id);
  }
  // -- Screens --

  handleFetchScreenById(result) {
    this.state.currentElement = result;
  }

  handleFetchScreensByCollectionId(result) {
    this.state.elements.screen = result;
  }

  handleUpdateScreen(screen) {
    this.state.currentElement = screen;
    this.handleRefreshElements({type: 'screen'});
  }

  handleCreateScreen(screen) {
    this.handleRefreshElements({type: 'screen'});
    this.navigateToNewElement(screen);
  }

  handleGenerateScreenFromClipboard(collection_id) {
    let clipboardWellplates = ClipboardStore.getState().wellplates;

    this.state.currentElement = Screen.buildFromWellplatesAndCollectionId(clipboardWellplates, collection_id);
  }

  // -- Reactions --

  handleFetchReactionById(result) {
    this.state.currentElement = result;
  }

  handleFetchReactionsByCollectionId(result) {
    this.state.elements.reaction = result;
  }

  handleUpdateReaction(reaction) {
    this.state.currentElement = reaction;
    this.handleRefreshElements({type: 'reaction'});
    this.handleRefreshElements({type: 'sample'});
  }

  handleCreateReaction(reaction) {
    this.handleRefreshElements({type: 'reaction'});
    this.navigateToNewElement(reaction);
  }

  handleCopyReactionFromId(reaction) {
    const uiState = UIStore.getState();
    this.state.currentElement = Reaction.copyFromReactionAndCollectionId(reaction, uiState.currentCollection.id);
  }

  handleOpenReactionDetails(reaction) {
    this.state.currentReaction = null;
    this.state.currentElement = reaction;
  }

  // -- Reactions Literatures --

  handleCreateReactionLiterature(result) {
    this.state.currentElement.literatures.push(result);
  }

  handleDeleteReactionLiterature(reactionId) {
    ElementActions.fetchLiteraturesByReactionId(reactionId);
    this.handleRefreshElements({type: 'reaction'});
  }

  handleFetchLiteraturesByReactionId(result) {
    this.state.currentElement.literatures = result.literatures;
  }

  // -- Reactions SVGs --

  handleFetchReactionSvgByMaterialsInchikeys(result) {
    this.state.currentElement.reaction_svg_file = result;
  }

  handleFetchReactionSvgByReactionId(result) {
    this.state.currentElement.reaction_svg_file = result;
  }

  // -- Generic --

  navigateToNewElement(element) {
    const uiState = UIStore.getState();
    Aviator.navigate(`/collection/${uiState.currentCollection.id}/${element.type}/${element.id}`);
  }

  handleGenerateEmptyElement(element) {
    let {currentElement} = this.state;

    const newElementOfSameTypeIsPresent = currentElement && currentElement.isNew && currentElement.type == element.type;
    if(!newElementOfSameTypeIsPresent) {
      this.state.currentElement = element;
    }
  }

  handleUnselectCurrentElement() {
    this.state.currentElement = null;
  }

  // FIXME: listens to UIAction !
  handleSetPagination(pagination) {
    this.waitFor(UIStore.dispatchToken);
    this.handleRefreshElements(pagination);
  }

  // TODO refactor me
  handleRefreshElements(params) {
    const {type, moleculeName, page} = params;
    this.waitFor(UIStore.dispatchToken);
    let uiState = UIStore.getState();

    if(moleculeName) {
      this.state.elements[moleculeName].page = page || 1;
    } else {
      this.state.elements[type].page = page || 1;
    }

    let currentSearchSelection = uiState.currentSearchSelection;
    const {currentMoleculeName} = this.state;
    // TODO if page changed -> fetch
    // if there is a currentSearchSelection we have to execute the respective action
    if(currentSearchSelection != null) {
      ElementActions.fetchBasedOnSearchSelectionAndCollection(currentSearchSelection, uiState.currentCollection.id, page);
    } else if (moleculeName) {
      ElementActions.fetchSamplesByMoleculeName({
        moleculeName: moleculeName,
        page: page,
        per_page: uiState[moleculeName].numberOfResults
      });
    } else {
      switch (type) {
        case 'sample':
          ElementActions.fetchSamplesByCollectionId(uiState.currentCollection.id, {page: page, per_page: uiState.numberOfResults});
          if(currentMoleculeName) {
            ElementActions.fetchSamplesByMoleculeName({
              moleculeName: currentMoleculeName,
              page: this.state.elements[currentMoleculeName].page,
              per_page: this.state.elements[currentMoleculeName].perPage
            });
          }
          break;
        case 'reaction':
          ElementActions.fetchReactionsByCollectionId(uiState.currentCollection.id, {page: page, per_page: uiState.numberOfResults});
          break;
        case 'wellplate':
          ElementActions.fetchWellplatesByCollectionId(uiState.currentCollection.id, {page: page, per_page: uiState.numberOfResults});
          break;
        case 'screen':
          ElementActions.fetchScreensByCollectionId(uiState.currentCollection.id, {page: page, per_page: uiState.numberOfResults});
          break;
      }
    }
  }
}

export default alt.createStore(ElementStore, 'ElementStore');
