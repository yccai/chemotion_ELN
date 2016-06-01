import React, {Component} from 'react'
import {Col, Row, Panel, ListGroup, ListGroupItem, ButtonToolbar, Button, Tabs, Tab} from 'react-bootstrap';
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

import StickyDiv from 'react-stickydiv'

export default class ReactionDetails extends Component {
  constructor(props) {
    super(props);
    const {reaction} = props;
    this.state = {
      reaction,
      reactionPanelFixed: false
    };
  }

  componentDidMount() {
    const {reaction} = this.state;
  }

  componentWillReceiveProps(nextProps) {
    const {reaction} = this.state;
    const nextReaction = nextProps.reaction;
    if (nextReaction.id != reaction.id || nextReaction.updated_at != reaction.updated_at) {
      this.setState({
        reaction: nextReaction
      });
    }
  }

  render() {
    const {reaction} = this.state;
    const svgContainerStyle = {
      textAlign: 'center'
    };
    const submitLabel = (true) ? "Create" : "Save";
    const style = {height: '220px'};
    let extraTabs =[];
    for (let j=0;j < XTab.TabCount;j++){
      extraTabs.push((i)=>this.extraTab(i))
    }
    return (
      <StickyDiv zIndex={2}>
        <Panel className="panel-fixed"
               header="Report QQ Details"
               bsStyle={true ? 'info' : 'primary'}>
          <Button bsStyle="danger"
                  bsSize="xsmall"
                  className="button-right" >
            <i className="fa fa-times"></i>
          </Button>
          <Row>
            <Col md={3} style={style}>
              <h3>HAHAH.....</h3>

            </Col>
            {}
          </Row>
        </Panel>
      </StickyDiv>
    );
  }
}
