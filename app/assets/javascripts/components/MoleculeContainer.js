import React, {Component} from 'react';
import {Button, Panel} from 'react-bootstrap';
import MoleculeGroupSamples from './MoleculeGroupSamples';

export default class MoleculeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moleculeName: props.moleculeName,
      isExpanded: false
    }
  }

  toogleExpansion() {
    const {isExpanded} = this.state;
    this.setState({
      isExpanded: !isExpanded
    });
  }

  header() {
    const {moleculeName} = this.state;

    return (
      <div>
        <Button bsSize='xsmall' onClick={() => this.toogleExpansion()}>+</Button>
        {moleculeName}
      </div>
    )
  }

  moleculeGroupSamples() {
    const {isExpanded, moleculeName} = this.state;
    if(isExpanded) {
      return <MoleculeGroupSamples moleculeName={moleculeName}/>
    }
  }

  render() {
    const {isExpanded} = this.state;

    return (
      <Panel header={this.header()} collapsible expanded={isExpanded} bsStyle="primary">
        {this.moleculeGroupSamples()}
      </Panel>
    );
  }
}
