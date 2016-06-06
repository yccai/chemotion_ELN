import React, {Component} from 'react'
import {Col, Row, Panel, ListGroup, ListGroupItem, ButtonToolbar, Button, Tabs, Tab} from 'react-bootstrap';
import StickyDiv from 'react-stickydiv'

import ElementCollectionLabels from './ElementCollectionLabels';
import ElementAnalysesLabels from './ElementAnalysesLabels';
import ElementActions from './actions/ElementActions';
import CollectionActions from './actions/CollectionActions';
import ReactionDetailsLiteratures from './ReactionDetailsLiteratures';
import ReactionDetailsAnalyses from './ReactionDetailsAnalyses';
import ReactionDetailsScheme from './ReactionDetailsScheme';
import ReactionDetailsProperties from './ReactionDetailsProperties';
import UIStore from './stores/UIStore';
import UIActions from './actions/UIActions';
import SVG from 'react-inlinesvg';
import Utils from './utils/Functions';
import XTab from "./extra/ReactionDetailsXTab";
import XTabName from "./extra/ReactionDetailsXTabName";


export default class ReportDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {

  }

  render() {
    const submitLabel = (true) ? "Create" : "Save"; // TBD
    const style = {height: '220px'};

    return (
      <StickyDiv zIndex={2}>
        <Panel className="panel-fixed"
               header="Report"
               bsStyle={true ? 'info' : 'primary'}>
          <Button bsStyle="danger"
                  bsSize="xsmall"
                  className="button-right" 
                  onClick={this.closeDetails.bind(this)}>
            <i className="fa fa-times"></i>
          </Button>
          <Row>
            <Col md={3} style={style}>
              <h3>HAHAH.....</h3>

            </Col>
          </Row>
        </Panel>
      </StickyDiv>
    );
  }

  closeDetails() {
    UIActions.deselectAllElements();
    Aviator.navigate(`/collection/all`);
  }
}
