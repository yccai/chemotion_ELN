import React, {Component} from 'react';
import MoleculeContainer from './MoleculeContainer';
import ElementActions from './actions/ElementActions';
import ElementStore from './stores/ElementStore';

export default class MoleculeContainerView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moleculeNames: []
    }
  }

  componentDidMount() {
    ElementActions.fetchMoleculeNames();
    ElementStore.listen((state) => this.onStoreChange(state));
  }

  componentWillUnmount() {
    ElementStore.unlisten((state) => this.onStoreChange(state));
  }

  onStoreChange(state) {
    this.setState({
      moleculeNames: state.moleculeNames
    });
  }

  moleculeGroups(moleculeNames) {
    return moleculeNames.map((moleculeName) => {
      return <MoleculeContainer moleculeName={moleculeName} />
    });
  }

  render() {
    const {moleculeNames} = this.state;

    return (
      <div>
        {this.moleculeGroups(moleculeNames)}
      </div>
    );
  }
}
