import React, {Component} from 'react';
import {Button, ListGroup, ListGroupItem,Glyphicon} from 'react-bootstrap';
import MaterialGroupContainer from './MaterialGroupContainer';
import Reaction from './models/Reaction';
import Sample from './models/Sample';
import Molecule from './models/Molecule';
import ReactionDetailsMainProperties from './ReactionDetailsMainProperties';

import ElementActions from './actions/ElementActions';
import UsersFetcher from './fetchers/UsersFetcher';
import NotificationActions from './actions/NotificationActions'

export default class ReportDetailsScheme extends Component {
  constructor(props) {
    super(props);
    const {report} = props;
    this.state = { report };
  }

  componentWillReceiveProps(nextProps) {
    const {report} = this.state;
    const nextReport = nextProps.report;
    this.setState({ report: nextReport });
  }

  render() {
    const {report} = this.state;
    let addSampleButton = (sampleType)=> <Button bsStyle="success" bsSize="xs" onClick={() => this.addSampleToMaterialGroup(report, sampleType)}><Glyphicon glyph="plus" /></Button>

    return (
      <div>
        <ListGroup fill>
          <ListGroupItem>
            <h4 className="list-group-item-heading" >{addSampleButton('starting_materials')}&nbsp;Starting Materials </h4>
            <MaterialGroupContainer
              materialGroup="starting_materials"
              materials={report.starting_materials}
              dropMaterial={(material, previousMaterialGroup, materialGroup) => this.dropMaterial(material, previousMaterialGroup, materialGroup)}
              deleteMaterial={(material, materialGroup) => this.deleteMaterial(material, materialGroup)}
              dropSample={(sample, materialGroup) => this.dropSample(sample, materialGroup)}
              showLoadingColumn={report.hasPolymers()}
              onChange={(changeEvent) => this.handleMaterialsChange(changeEvent)}
              />
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
