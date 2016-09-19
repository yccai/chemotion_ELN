import React from 'react';
import { Navbar, Nav, NavItem} from 'react-bootstrap';
import SVG from 'react-inlinesvg'

import UserStore from '../components/stores/UserStore';
import UserActions from '../components/actions/UserActions';
import DocumentHelper from '../components/utils/DocumentHelper';

import NavHead from '../libHome/NavHead'
import NavNewSession from './NavNewSession'
import UserAuth from './UserAuth'
//import HomeStore from './stores/HomeStore'
import HomeActions from './actions/HomeActions'

export default class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null
    }
    this.onChange = this.onChange.bind(this)
  }

  componentDidMount() {
    UserStore.listen(this.onChange);
    UserActions.fetchCurrentUser();
  }

  componentWillUnmount() {
    UserStore.unlisten(this.onChange);
  }

  onChange(state) {
    this.setState({
      currentUser: state.currentUser
    });
  }

  token(){
    return DocumentHelper.getMetaContent("csrf-token")
  }

  complatLogo(){
    return <div ><SVG src="images/complat_logo.svg"  className='hp-nav-logo' /></div>
  }

  handleSelectMyActivities(eventKey){
    HomeActions.selectMyActivities(eventKey)
    console.log(eventKey);
  }

  render() {
    return (this.state.currentUser
      ? <Navbar fluid>
          <Navbar.Header>
            <Navbar.Brand>
              <NavHead/>
            </Navbar.Brand>
          </Navbar.Header>
          <Nav onSelect={this.handleSelectMyActivities}>
            <NavItem eventKey='Compound' >My Compound Activities</NavItem>
            <NavItem eventKey='Screening'>My Screening Activities</NavItem>
          </Nav>
          <UserAuth/>
        </Navbar>
      : <Navbar  fluid>
          <Navbar.Header>
            <Navbar.Brand>
              <NavHead/>
            </Navbar.Brand>
          </Navbar.Header>
          <NavNewSession authenticityToken={this.token()}/>
        </Navbar>
    )
  }
}
