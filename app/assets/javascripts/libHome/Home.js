import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { Grid, Row, Col} from 'react-bootstrap';
import SVG from 'react-inlinesvg'

import Navigation from './Navigation'
import LoreIpsum from './LoreIpsum'

class Home extends Component {
  constructor(props) {
    super();

  }

  render() {

    return (

      <Grid fluid>
        <Row className="card-navigation">
          <Navigation/>
        </Row>

        <Row style={{overflowX: 'hidden'}}>
          <img className='hp-bg-img' src="images/boxes_10_blue.jpg" />
          <div className='hp-sub-title-block'>
            <div className='hp-cp-logo'>
              <SVG src="images/complat_logo.svg"   />
            </div>
            <div className='hp-sub-title'>
              The Service Facility for Compound Storage, Management, and Sharing
            </div>
          </div>
        </Row>

        <Row>

          <Col md={2}></Col>

          <Col md={10}>
            <LoreIpsum/>
          </Col>

        </Row>

      </Grid>
    )
  }
}

$(document).ready(function() {
  let domElement = document.getElementById('Home');
  if (domElement){
    ReactDOM.render(<Home />, domElement);
  }
});
