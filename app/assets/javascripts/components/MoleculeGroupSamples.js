import React, {Component} from 'react';
import SamplesByMoleculeTable from './SamplesByMoleculeTable';
import ElementActions from './actions/ElementActions';
import ElementStore from './stores/ElementStore';

export default class MoleculeGroupSamples extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moleculeName: props.moleculeName,
      perPage: 7
    }
  }

  componentDidMount() {
    const {moleculeName, perPage} = this.state;
    ElementActions.fetchSamplesByMoleculeName({
      moleculeName: moleculeName,
      per_page: perPage
    });
  }

  render() {
    const {moleculeName, perPage} = this.state;
    return (
      <SamplesByMoleculeTable
        overview={false}
        moleculeName={moleculeName}
        perPage={perPage} />
    )
  }
}
