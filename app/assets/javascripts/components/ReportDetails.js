import React, {Component} from 'react'
import {Col, Row, Panel, ListGroup, ListGroupItem, ButtonToolbar, Button, Tabs, Tab} from 'react-bootstrap';
import StickyDiv from 'react-stickydiv'

import ElementCollectionLabels from './ElementCollectionLabels';
import ElementAnalysesLabels from './ElementAnalysesLabels';
import ElementActions from './actions/ElementActions';
import CollectionActions from './actions/CollectionActions';

import ReportDetailsScheme from './ReportDetailsScheme';

import UIStore from './stores/UIStore';
import UIActions from './actions/UIActions';
import SVG from 'react-inlinesvg';
import Utils from './utils/Functions';
import XTab from "./extra/ReactionDetailsXTab";
import XTabName from "./extra/ReactionDetailsXTabName";


export default class ReportDetails extends Component {
  constructor(props) {
    super(props);
    const {report} = props;
    this.state = {
      report
    };
  }

  componentDidMount() {
    const {report} = this.state;
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
              <h3>I am the title</h3>
              <Button>
                Generate Report
              </Button>
            </Col>
          </Row>

          <hr/>
          <Tabs defaultActiveKey={0}>
            <Tab eventKey={0} title={'Scheme'}>
              <ReportDetailsScheme
                report={report}
                onReportChange={(report, options) => this.handleReportChange(report, options)}
                />
            </Tab>
          </Tabs>

          <hr/>
          <ButtonToolbar>
            <Button bsStyle="primary" onClick={() => this.closeDetails()}>
              Close
            </Button>
            <Button bsStyle="warning" onClick={() => this.submitFunction()} disabled={!this.reportIsValid()}>
              {submitLabel}
            </Button>
            <Button bsStyle="default" onClick={() => CollectionActions.downloadReportReprot(report.id)}>
              Export samples
            </Button>
          </ButtonToolbar>
        </Panel>
      </StickyDiv>
    );
  }

  closeDetails() {
    UIActions.deselectAllElements();
    Aviator.navigate(`/collection/all`);
  }
}
