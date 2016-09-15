import React from 'react'
import {Jumbotron} from 'react-bootstrap'

const TabHome = () => {
  return(
    <div>
      <br/><br/><br/>
      <Jumbotron className='tab-home'>
        The Compound Plattform (ComPlat) is a service facility
        for the cataloging, the storage, and the supply of chemical compounds
        from and for academic research institutions.
        The major aim of the ComPlat is the provision of necessary infrastructure
        for non-profit research institutions to allow a re-use of research results
        and to support cooperative projects among researchers.
      </Jumbotron>
      <br/><br/><br/>
    </div>
  )
}

TabHome.propTypes = {

}

export default TabHome;
