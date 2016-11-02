import React from 'react'
import {Button, FormGroup, FormControl, Glyphicon, Jumbotron, Grid, Row, Col} from 'react-bootstrap';

const NewSession = ({authenticityToken}) => {

  return(


        <Col xs={12} sm={8} md={6} lg={4} smOffset={2} mdOffset={3} lgOffset={4} >
          <Jumbotron>
            <div>
              <form id="new_user" className="new_user" action="/users/sign_in" acceptCharset='UTF-8' method="post" >
                <input name="utf8" value="✓" type="hidden"/>
                <input name="authenticity_token" value={authenticityToken} type="hidden"/>
                <FormGroup>
                  <FormControl id='user_email' type="email" placeholder="email" name="user[email]" />
                </FormGroup>
                <FormGroup>
                  <FormControl id='user_password' type="password" name="user[password]" placeholder="password"/>
                </FormGroup>
                <span >
                  <Button type="submit" bsStyle='primary'  >
                    <Glyphicon glyph="log-in"  />
                  </Button>
                  &nbsp;&nbsp;<a href='/users/sign_up' > or Sign Up </a>
                </span>
              </form>
            </div>
          </Jumbotron>
        </Col>


  )
}

NewSession.propTypes = {
  authenticityToken: React.PropTypes.string.isRequired,
}

export default NewSession;
