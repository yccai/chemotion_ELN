import React from 'react'
import {Jumbotron} from 'react-bootstrap'

const UnderConstruction = () => {

  return(
    <Jumbotron className='tab-home'>

      <h2><i className="fa fa-exclamation-triangle"/> This site is under construction</h2>
      <br/><br/>
      <span>We are currently working on a new version for this site. Stay tuned! </span><br/>

    </Jumbotron>
  )
}

UnderConstruction.propTypes = {

}

export default UnderConstruction;
