import Element from './Element';
import Molecule from './Molecule';
import Analysis from './Analysis';
import _ from 'lodash';
import UserActions from '../actions/UserActions';
import UserStore from '../stores/UserStore';

export default class Sample extends Element {
  isMethodRestricted(m) {
    return false;
  }

  static copyFromSampleAndCollectionId(sample, collection_id) {
    let newSample = sample.buildCopy();
    newSample.collection_id = collection_id;

    return newSample;
  }

  buildCopy() {
    let sample = super.buildCopy();
    sample.short_label = sample.short_label + " Copy";
    return sample;
  }

  buildChild() {
    Sample.counter += 1;

    //increase subsample count per sample on client side, as we have no persisted data at this moment
    let children_count = parseInt(Sample.children_count[this.id] || this.children_count);
    children_count += 1;
    Sample.children_count[this.id] = children_count;

    let splitSample = this;
    splitSample.parent_id = this.id;
    splitSample.id = Element.buildID();
    splitSample.name = null;
    splitSample.short_label += "-" + children_count;
    splitSample.created_at = null;
    splitSample.updated_at = null;
    splitSample.target_amount_value = 0;
    splitSample.real_amount_value = null;
    splitSample.is_split = true;
    splitSample.is_new = true;
    return splitSample;
  }

  get isSplit() {
    return this.is_split
  }

  serialize() {
    var serialized = super.serialize({
      name: this.name,
      external_label: this.external_label,
      target_amount_value: this.target_amount_value,
      target_amount_unit: this.target_amount_unit,
      real_amount_value: this.real_amount_value,
      real_amount_unit: this.real_amount_unit,
      description: this.description,
      purity: this.purity,
      solvent: this.solvent,
      impurities: this.impurities,
      location: this.location,
      molfile: this.molfile,
      molecule: this.molecule && this.molecule.serialize(),
      sample_svg_file: this.sample_svg_file,
      is_top_secret: this.is_top_secret || false,
      parent_id: this.parent_id,
      analyses: this.analyses.map(a => a.serialize()),
      residues: this.residues,
      is_split: this.is_split || false,
      is_new: this.is_new,
      imported_readout: this.imported_readout
    });

    return serialized;
  }

  static buildEmpty(collection_id) {
    let sample = new Sample({
      collection_id: collection_id,
      type: 'sample',
      external_label: '',
      target_amount_value: 0,
      target_amount_unit: 'mg',
      description: '',
      purity: 1,
      solvent: '',
      impurities: '',
      location: '',
      molfile: '',
      molecule: { id: '_none_' },
      analyses: [],
      elemental_analyses: {},
      residues: [
        {
          residue_type: 'polymer', custom_info: {
            "formula": null,
            "loading": null,
            "polymer_type": "polystyrene",
            "loading_type": "mass"
            }
        }
      ],
      imported_readout: '',
      attached_amount_mg: '' // field for polymers calculations
    });

    sample.short_label = Sample.buildNewSampleShortLabelForCurrentUser();
    return sample;
  }

  static buildEmptyWithCounter(collection_id, counter) {
    let sample = new Sample({
      collection_id: collection_id,
      type: 'sample',
      external_label: '',
      target_amount_value: 0,
      target_amount_unit: 'mg',
      description: '',
      purity: 1,
      solvent: '',
      impurities: '',
      location: '',
      molfile: '',
      molecule: { id: '_none_' },
      analyses: [],
      elemental_analyses: {},
      residues: [],
      imported_readout: ''
    });

    sample.short_label = Sample.buildNewSampleShortLabelWithCounter(counter);
    return sample;
  }

  static buildNewSampleShortLabelWithCounter(counter) {
    let {currentUser} = UserStore.getState();

    return `${currentUser.initials}-${counter}`;
  }

  static buildNewSampleShortLabelForCurrentUser() {
    let {currentUser} = UserStore.getState();
    if(!currentUser) {
      return 'NEW SAMPLE';
    } else {
      return `${currentUser.initials}-${currentUser.samples_count + 1}`;
    }
  }

  get is_top_secret() {
    return this._is_top_secret;
  }

  set is_top_secret(is_top_secret) {
    this._is_top_secret = is_top_secret;
  }

  title() {
    return this.name ? `${this.short_label} ${this.name}` : this.short_label
  }

  get name() {
    return this._name;
  }

  set name(name) {
    this._name = name;
  }

  get short_label() {
    return this._short_label;
  }

  set short_label(short_label) {
    this._short_label = short_label;
  }

  get external_label() {
    return this._external_label;
  }

  set external_label(label) {
    this._external_label = label;
  }

  get location() {
    return this._location;
  }

  set location(location) {
    this._location = location;
  }

  get description() {
    return this._description;
  }

  set description(description) {
    this._description = description;
  }

  get impurities() {
    return this._impurities;
  }

  set impurities(impurities) {
    this._impurities = impurities;
  }

  get imported_readout() {
    return this._imported_readout;
  }

  set imported_readout(imported_readout) {
    this._imported_readout = imported_readout;
  }

  setAmountAndNormalizeToMilligram(amount_value, amount_unit) {
    this.amount_value = this.convertToMilligram(amount_value, amount_unit)
    this.amount_unit = 'mg'
  }


  get amountType() {
    return this._current_amount_type || this.defaultAmountType();
  }

  set amountType(amount_type) {
    this._current_amount_type = amount_type;
  }

  defaultAmountType() {
    return this.real_amount_value ? 'real' : 'target';
  }

  get defined_part_amount() {
    let mw = this.molecule_molecular_weight;
    return this.amount_mmol * mw;
  }

  // amount proxy

  get amount() {
    return({
      value: this.amount_value,
      unit: this.amount_unit
    })
  }

  get amount_value() {
    return this.amountType === 'real' ? this.real_amount_value : this.target_amount_value;
  }

  set amount_value(amount_value) {
    if(this.amountType === 'real') {
      this.real_amount_value = amount_value;
    } else {
      this.target_amount_value = amount_value;
    }
  }

  get amount_unit() {
    return (this.amountType === 'real' ? this.real_amount_unit : this.target_amount_unit) || 'mg';
  }

  set amount_unit(amount_unit) {
    if(this.amountType === 'real') {
      this.real_amount_unit = amount_unit;
    } else {
      this.target_amount_unit = amount_unit;
    }
  }

  // target amount

  get target_amount_value() {
    return this._target_amount_value;
  }

  set target_amount_value(amount_value) {
    this._target_amount_value = amount_value
  }

  get target_amount_unit() {
    return this._target_amount_unit || 'mg';
  }

  set target_amount_unit(amount_unit) {
    this._target_amount_unit = amount_unit
  }

  // real amount

  get real_amount_value() {
    return this._real_amount_value;
  }

  set real_amount_value(amount_value) {
    this._real_amount_value = amount_value
  }

  get real_amount_unit() {
    return this._real_amount_unit || 'mg';
  }

  set real_amount_unit(amount_unit) {
    this._real_amount_unit = amount_unit
  }

  get amount_mg() {
    return this.convertMilligramToUnit(this.amount_value, 'mg')
  }

  get amount_ml() {
    return this.convertMilligramToUnit(this.amount_value, 'ml')
  }

  get amount_mmol() {
    return this.convertMilligramToUnit(this.amount_value, 'mmol')
  }

  //Menge in mmol = Menge (mg) * Reinheit  / Molmasse (g/mol)
	//Volumen (ml) = Menge (mg) / Dichte (g/ml) / 1000
	//Menge (mg)  = Volumen (ml) * Dichte (g/ml) * 1000
	//Menge (mg) = Menge (mmol)  * Molmasse (g/mol) / Reinheit

  convertMilligramToUnit(amount_mg, unit) {
    if(this.contains_residues) {
      var loading = this.residues[0].custom_info.loading;
      switch (unit) {
        case 'mg':
          return amount_mg;
          break;
        case 'mmol':
            return (loading * amount_mg) / 1000.0;
            break;
        default:
          return loading * amount_mg;
      }
    } else {
      switch (unit) {
        case 'mg':
          return amount_mg;
          break;
        case 'ml':
          let molecule_density = this.molecule_density || 1.0;
          if(molecule_density) {
            return amount_mg / molecule_density / 1000;
            break;
          }
        case 'mmol':
          let molecule_molecular_weight = this.molecule_molecular_weight
          if (molecule_molecular_weight) {
            return amount_mg * (this.purity || 1.0) / molecule_molecular_weight;
            break;
          }
        default:
          return amount_mg
      }
    }
  }

  convertToMilligram(amount_value, amount_unit) {
    if(this.contains_residues) {
      switch (amount_unit) {
        case 'mg':
          return amount_value;
          break;
        case 'mmol':
          let loading = this.residues[0].custom_info.loading;
          if(!loading) {
            return 0.0;
          } else {
            return 1000.0 * amount_value / loading;
          }
          break;
        default:
          return amount_value
      }
    } else {
      switch (amount_unit) {
        case 'mg':
          return amount_value;
          break;
        case 'ml':
          return amount_value * (this.molecule_density || 1.0) * 1000;
          break;
        case 'mmol':
          return amount_value / (this.purity || 1.0) * this.molecule_molecular_weight;
          break;
        default:
          return amount_value
      }
    }
  }

  get molecule_iupac_name() {
    return this.molecule && this.molecule.iupac_name;
  }

  set molecule_iupac_name(iupac_name) {
    this.molecule.iupac_name = iupac_name;
  }

  get molecule_density() {
    return this.molecule && this.molecule.density;
  }

  set molecule_density(density) {
    this.molecule.density = density;
  }

  get molecule_molecular_weight() {
    return this.molecule && this.molecule.correctedMolecularWeight
  }

  get polymer_desc() {
    let info = this.residues[0] && this.residues[0].custom_info;
    if(info) {
      return info.polymer_type + ', ' + info.formula;
    } else {
      return ''
    }
  }

  get molecule_formula() {
    return this.molecule && this.molecule.sum_formular;
  }

  get molecule_inchistring() {
    return this.molecule && this.molecule.inchistring;
  }

  get molecule_boiling_point() {
    return this.molecule && this.molecule.boiling_point;
  }

  set molecule_boiling_point(bp) {
    this.molecule.boiling_point = bp;
  }

  get molecule_melting_point() {
    return this.molecule && this.molecule.melting_point;
  }

  set molecule_melting_point(mp) {
    this.molecule.melting_point = mp;
  }

  get purity() {
    return this._purity
  }

  set purity(purity) {
    this._purity = purity
  }

  get molecule() {
    return this._molecule
  }

  set molecule(molecule) {
    this._molecule = new Molecule(molecule)
    if(molecule.temp_svg) {
      this.sample_svg_file = molecule.temp_svg;
    }
  }

  get svgPath() {
    if (this.sample_svg_file){
      return `/images/samples/${this.sample_svg_file}`;
    } else {
      return this.molecule && this.molecule.molecule_svg_file ? `/images/molecules/${this.molecule.molecule_svg_file}` : '';
    }
  }
  //todo: have a dedicated Material Sample subclass

  set equivalent(equivalent) {
    this._equivalent = equivalent;
  }

  get equivalent() {
    return this._equivalent;
  }

  serializeMaterial() {
    let params = this.serialize();
    let extra_params = {
      equivalent: this.equivalent,
      reference: this.reference || false
    }
    _.merge(params, extra_params);
    return params;
  }

  // -- Analyses --

  get analyses() {
    return (this._analyses || []).map(a => new Analysis(a));
  }

  set analyses(analyses) {
    this._analyses = analyses.map(a => new Analysis(a));
  }

  addAnalysis(analysis) {
    let analyses = this.analyses;
    analyses.push(analysis);
    this.analyses = analyses;
  }

  removeAnalysis(analysis) {
    let analyses = this.analyses;
    _.remove(analyses, (a) => { return a.id == analysis.id});
    this.analyses = analyses;
  }

  updateAnalysis(changedAnalysis) {
    this.analyses.find(analysis => {
      if(analysis.id == changedAnalysis.id) {
        const analysisPosition = _.findIndex(this.analyses, (a) => { return a.id == analysis.id});
        this._analyses[analysisPosition] = changedAnalysis;
      }
    });
  }
};

Sample.counter = 0;
Sample.children_count = {}
