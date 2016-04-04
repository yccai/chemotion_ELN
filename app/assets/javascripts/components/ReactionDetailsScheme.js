import React, {Component} from 'react';
import {Button, ListGroup, ListGroupItem} from 'react-bootstrap';
import MaterialGroupContainer from './MaterialGroupContainer';
import Reaction from './models/Reaction';
import Sample from './models/Sample';

import ReactionDetailsMainProperties from './ReactionDetailsMainProperties';

import ElementActions from './actions/ElementActions';
import UsersFetcher from './fetchers/UsersFetcher';
import NotificationActions from './actions/NotificationActions'

export default class ReactionDetailsScheme extends Component {
  constructor(props) {
    super(props);
    const {reaction} = props;
    this.state = { reaction };
  }

  componentWillReceiveProps(nextProps) {
    const {reaction} = this.state;
    const nextReaction = nextProps.reaction;
    this.setState({ reaction: nextReaction });
  }

  dropSample(sample, materialGroup) {
    const {reaction} = this.state;
    if(reaction.hasSample(sample.id)) {
      NotificationActions.add({
        message: 'The sample is already present in current reaction.',
        level: 'error'
      });

      return false;
    }

    const splitSample = sample.buildChild();
    reaction.addMaterial(splitSample, materialGroup);
    this.onReactionChange(reaction, {schemaChanged: true});
  }

  deleteMaterial(material, materialGroup) {
    let {reaction} = this.state;
    reaction.deleteMaterial(material, materialGroup);
    this.onReactionChange(reaction, {schemaChanged: true});
  }

  dropMaterial(material, previousMaterialGroup, materialGroup) {
    const {reaction} = this.state;
    reaction.moveMaterial(material, previousMaterialGroup, materialGroup);
    this.onReactionChange(reaction, {schemaChanged: true});
  }

  onReactionChange(reaction, options={}) {
    this.props.onReactionChange(reaction, options);
  }

  handleMaterialsChange(changeEvent) {
    console.log("changeEvent.type: " + changeEvent.type);
    switch (changeEvent.type) {
      case 'referenceChanged':
        this.onReactionChange(
          this.updatedReactionForReferenceChange(changeEvent)
        );
        break;
      case 'amountChanged':
        this.onReactionChange(
          this.updatedReactionForAmountChange(changeEvent)
        );
        break;
      case 'loadingChanged':
        this.onReactionChange(
          this.updatedReactionForLoadingChange(changeEvent)
        );
        break;
      case 'amountTypeChanged':
        this.onReactionChange(
          this.updatedReactionForAmountTypeChange(changeEvent)
        );
        break;
      case 'equivalentChanged':
        this.onReactionChange(
          this.updatedReactionForEquivalentChange(changeEvent)
        );
        break;
    }
  }

  updatedReactionForReferenceChange(changeEvent) {
    const {sampleID} = changeEvent;
    const {reaction} = this.state;
    const sample = reaction.sampleById(sampleID);

    reaction.markSampleAsReference(sampleID);

    return this.updatedReactionWithSample(this.updatedSamplesForReferenceChange.bind(this), sample)
  }

  updatedReactionForAmountChange(changeEvent) {
    let {sampleID, amount} = changeEvent;
    let updatedSample = this.props.reaction.sampleById(sampleID);

    // normalize to milligram
    updatedSample.setAmountAndNormalizeToMilligram(amount.value, amount.unit);

    return this.updatedReactionWithSample(this.updatedSamplesForAmountChange.bind(this), updatedSample)
  }

  updatedReactionForLoadingChange(changeEvent) {
    let {sampleID, amountType} = changeEvent;
    let updatedSample = this.props.reaction.sampleById(sampleID);

    updatedSample.amountType = amountType;

    return this.updatedReactionWithSample(this.updatedSamplesForAmountChange.bind(this), updatedSample)
  }

  updatedReactionForAmountTypeChange(changeEvent) {
    let {sampleID, amountType} = changeEvent;
    let updatedSample = this.props.reaction.sampleById(sampleID);

    updatedSample.amountType = amountType;

    return this.updatedReactionWithSample(this.updatedSamplesForAmountChange.bind(this), updatedSample)
  }

  updatedReactionForEquivalentChange(changeEvent) {
    let {sampleID, equivalent} = changeEvent;
    let updatedSample = this.props.reaction.sampleById(sampleID);

    updatedSample.equivalent = equivalent;

    return this.updatedReactionWithSample(this.updatedSamplesForEquivalentChange.bind(this), updatedSample)
  }

  calculateEquivalent(referenceMaterial, updatedSample) {
    if(!referenceMaterial.contains_residues) {
      NotificationActions.add({
        message: 'Cannot perform calculations for loading and equivalent.',
        level: 'error'
      });

      return 1.0;
    }

    let loading = referenceMaterial.residues[0].custom_info.loading;
    let mass_koef = updatedSample.amount_mg / referenceMaterial.amount_mg;
    let mwb = updatedSample.molecule.molecular_weight;
    let mwa = referenceMaterial.molecule.molecular_weight;
    let mw_diff = mwb - mwa;
    let equivalent = (1000.0 / loading) * (mass_koef - 1.0) / mw_diff;


    if(isNaN(equivalent) || !isFinite(equivalent)){
      equivalent = 1.0;
      sample.setAmountAndNormalizeToMilligram(referenceMaterial.amount_value, referenceMaterial.amount_unit);
    }

    return equivalent;
  }

  checkMassMolecule(referenceM, updatedS) {
    let errorMsg;
    let mFull;
    let mwb = updatedS.molecule.molecular_weight;

    // mass check apply to 'polymers' only
    if(!updatedS.contains_residues) {
      mFull = referenceM.amount_mmol * mwb * 1000.0;
    } else {
      let mwa = referenceM.molecule.molecular_weight;
      let deltaM = mwb - mwa;
      let massA = referenceM.amount_mg;
      mFull = massA + referenceM.amount_mmol * deltaM;

      let massExperimental = updatedS.amount_mg;
      if(deltaM > 0) { //expect weight gain
        if(massExperimental > mFull) {
          errorMsg = 'Experimental mass value is more than possible \
                      by 100% conversion! Please check your data.';
        } else if(massExperimental < massA) {
          errorMsg = 'Material loss! \
                    Experimental mass value is less than possible! \
                    Please check your data.';
        }
      } else { //expect weight loss
        if(massExperimental < mFull) {
          errorMsg = 'Experimental mass value is less than possible \
                      by 100% conversion! Please check your data.';
        }
      }
    }

    if(errorMsg) {
      updatedS.error_mass = true;
      NotificationActions.add({
        message: errorMsg,
        level: 'error'
      });
    } else {
      updatedS.error_mass = false;
    }

    return {
      mFull: mFull,
      errorMsg: errorMsg
    }
  }

  checkMassPolymer(referenceM, updatedS, massAnalyses) {
    let equivalent = this.calculateEquivalent(referenceM, updatedS);
    updatedS.equivalent = equivalent;

    let newAmountMmol;
    let newLoading;

    if(massAnalyses.errorMsg) {
      newAmountMmol = referenceM.amount_mmol;
      newLoading = newAmountMmol / massAnalyses.mFull * 1000.0;
    } else {
      newAmountMmol = referenceM.amount_mmol * equivalent;
      newLoading = newAmountMmol / updatedS.amount_mg * 1000.0;
    }

    updatedS.residues[0].custom_info.loading = newLoading;
  }

  updatedSamplesForAmountChange(samples, updatedSample, group) {
    const {referenceMaterial} = this.props.reaction;
    return samples.map((sample) => {
      if (sample.id == updatedSample.id) {
        sample.setAmountAndNormalizeToMilligram(updatedSample.amount_value, updatedSample.amount_unit);

        if(referenceMaterial && sample.amountType != 'real') {
          if(!updatedSample.reference && referenceMaterial.amount_value) {
            sample.equivalent = sample.amount_mmol / referenceMaterial.amount_mmol;

            let massAnalyses = this.checkMassMolecule(referenceMaterial, updatedSample);
            if(updatedSample.contains_residues) {
              this.checkMassPolymer(referenceMaterial, updatedSample, massAnalyses);
            }

          } else {
            sample.equivalent = 1.0;
          }
        }
      }
      else {
        if(updatedSample.reference) {
          if(sample.equivalent && sample.amountType != 'real') {
            sample.setAmountAndNormalizeToMilligram(sample.equivalent * updatedSample.amount_mmol, 'mmol');
          }
        }
      }
      return sample;
    });
  }

  updatedSamplesForEquivalentChange(samples, updatedSample) {
    const {referenceMaterial} = this.props.reaction;
    return samples.map((sample) => {
      if (sample.id == updatedSample.id) {
        sample.equivalent = updatedSample.equivalent;
        if(referenceMaterial && referenceMaterial.amount_value) {
          sample.setAmountAndNormalizeToMilligram(updatedSample.equivalent * referenceMaterial.amount_mmol, 'mmol');
        }
        else if(sample.amount_value) {
          sample.setAmountAndNormalizeToMilligram(updatedSample.equivalent * sample.amount_mmol, 'mmol');
        }
      }
      return sample;
    });
  }

  updatedSamplesForReferenceChange(samples, referenceMaterial) {
    return samples.map((sample) => {
      if (sample.id == referenceMaterial.id) {
        sample.equivalent = 1.0;
        sample.reference = true;
      }
      else {
        if(sample.amount_value) {
          let referenceAmount = referenceMaterial.amount_mmol;
          if(referenceMaterial && referenceAmount) {
            sample.equivalent = sample.amount_mmol / referenceAmount;
          }
        }
        sample.reference = false;
      }
      return sample;
    });
  }

  updatedReactionWithSample(updateFunction, updatedSample) {
    const {reaction} = this.state;
    reaction.starting_materials = updateFunction(reaction.starting_materials, updatedSample);
    reaction.reactants = updateFunction(reaction.reactants, updatedSample);
    reaction.products = updateFunction(reaction.products, updatedSample);
    return reaction;
  }

  /**
   * Add a (not yet persisted) sample to a material group
   * of the given reaction
   */
  addSampleToMaterialGroup(reaction, materialGroup) {
    UsersFetcher.fetchCurrentUser().then((result) => {
      reaction.initializeTemporarySampleCounter(result.user);

      ElementActions.addSampleToMaterialGroup({
        reaction,
        materialGroup
      });
    });
  }

  render() {
    const {reaction} = this.state;
    return (
      <div>
        <ListGroup fill>
          <ListGroupItem>
            <h4 className="list-group-item-heading" >Starting Materials</h4>
            <MaterialGroupContainer
              materialGroup="starting_materials"
              materials={reaction.starting_materials}
              dropMaterial={(material, previousMaterialGroup, materialGroup) => this.dropMaterial(material, previousMaterialGroup, materialGroup)}
              deleteMaterial={(material, materialGroup) => this.deleteMaterial(material, materialGroup)}
              dropSample={(sample, materialGroup) => this.dropSample(sample, materialGroup)}
              onChange={(changeEvent) => this.handleMaterialsChange(changeEvent)}
              />
              <Button onClick={() => this.addSampleToMaterialGroup(reaction, 'starting_materials')}>Add Sample</Button>
          </ListGroupItem>
          <ListGroupItem>
            <h4 className="list-group-item-heading" >Reactants</h4>
            <MaterialGroupContainer
              materialGroup="reactants"
              materials={reaction.reactants}
              dropMaterial={(material, previousMaterialGroup, materialGroup) => this.dropMaterial(material, previousMaterialGroup, materialGroup)}
              deleteMaterial={(material, materialGroup) => this.deleteMaterial(material, materialGroup)}
              dropSample={(sample, materialGroup) => this.dropSample(sample, materialGroup)}
              onChange={(changeEvent) => this.handleMaterialsChange(changeEvent)}
              />
              <Button onClick={() => this.addSampleToMaterialGroup(reaction, 'reactants')}>Add Sample</Button>
          </ListGroupItem>
          <ListGroupItem>
            <h4 className="list-group-item-heading" >Products</h4>
            <MaterialGroupContainer
              materialGroup="products"
              materials={reaction.products}
              dropMaterial={(material, previousMaterialGroup, materialGroup) => this.dropMaterial(material, previousMaterialGroup, materialGroup)}
              deleteMaterial={(material, materialGroup) => this.deleteMaterial(material, materialGroup)}
              dropSample={(sample, materialGroup) => this.dropSample(sample, materialGroup)}
              onChange={(changeEvent) => this.handleMaterialsChange(changeEvent)}
              />
              <Button onClick={() => this.addSampleToMaterialGroup(reaction, 'products')}>Add Sample</Button>
          </ListGroupItem>
        </ListGroup>
        <ReactionDetailsMainProperties
          reaction={reaction}
          onReactionChange={reaction => this.onReactionChange(reaction)}
          />
      </div>
    );
  }
}
