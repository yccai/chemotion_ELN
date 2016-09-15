import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { Grid, Row} from 'react-bootstrap';
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
        <Row className="card-navigation">
          <Navigation/>
        </Row>

        <Row style={{overflowX: 'hidden', position: 'relative', top: 45}}>
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
