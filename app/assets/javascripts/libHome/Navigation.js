import React from 'react';
import {Nav, Navbar, NavDropdown, MenuItem} from 'react-bootstrap';
import SVG from 'react-inlinesvg'
import UserAuth from '../components/UserAuth';

export default class Navigation extends React.Component {
  constructor(props) {
    super(props);
  }


  complatLogo(){
    return <div ><SVG src="images/complat_logo.svg"  className='hp-nav-logo' /></div>
  }
  brandDropDown() {
    return (
      <NavDropdown title={this.complatLogo()}  id="bg-nested-dropdown-brand">
        <MenuItem eventKey="11" href="http://www.chemotion.net" target="_blank">Chemotion repository</MenuItem>
      </NavDropdown>
    )
  }

  render() {
    return (
      <Navbar  fluid >
        <Navbar.Header>
          <Navbar.Brand>
            {this.complatLogo()}
          </Navbar.Brand>
        </Navbar.Header>

        <UserAuth/>

      </Navbar>
    )
  }
}
