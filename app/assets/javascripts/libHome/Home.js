import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { Grid, Row} from 'react-bootstrap';
import SVG from 'react-inlinesvg'

import HomeStore from './stores/HomeStore'
import Navigation from './Navigation'
import TabsMenu from './TabsMenu'
import MyActivitiesModal from './MyActivitiesModal'

class Home extends Component {
  constructor(props) {
    super();
    this.state={
      showMyActivities: false,
    }
    this.handleHomeStoreChange = this.handleHomeStoreChange.bind(this)
  }

  componentDidMount() {
    HomeStore.listen(this.handleHomeStoreChange);
  }

  componentWillUnmount() {
    HomeStore.unlisten(this.handleHomeStoreChange);
  }

  handleHomeStoreChange(state) {
    if(this.state.showMyActivities != state.showMyActivities) {
      this.setState({showMyActivities: state.showMyActivities});
    }
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
        

        <MyActivitiesModal/>
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
