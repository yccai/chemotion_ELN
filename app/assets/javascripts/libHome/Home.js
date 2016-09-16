import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { Grid, Row, Col} from 'react-bootstrap';
import SVG from 'react-inlinesvg'

import Navigation from './Navigation'
import TabsMenu from './TabsMenu'

class Home extends Component {
  constructor(props) {
    super();
  }

  render() {

    return (
      <Grid fluid>
        <Row className="hp-card-navigation">
          <Navigation/>
        </Row>

        <Row className='hp-card-content'>
          <img className='hp-bg-img' src="images/boxes_10_blue.jpg" />
          <div className='hp-sub-title-block'>
            <SVG src="images/complat_logo.svg"  className='hp-cp-logo' />
            <div className='hp-sub-title'>
              The Service Facility for Compound Storage, Management, and Sharing
            </div>
          </div>
        </Row>

        <Row>
          <TabsMenu/>
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
