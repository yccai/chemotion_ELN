import React from 'react'
import { Tabs, Tab} from 'react-bootstrap';

import TabHome from './TabHome'
import TabTakePart from './TabTakePart'
import TabChemical from './TabChemical'
import TabScreening from './TabScreening'
import TabAbout from './TabAbout'
import TabContact from './TabContact'

const TabsMenu = () => {
  let titleIt=(title)=><div className='tab-title'>{title}</div>
  return(
    <Tabs  justified defaultActiveKey={1} id='Home-menu' >
      <Tab eventKey={1} title={titleIt("Home")}><TabHome/></Tab>
      <Tab eventKey={2} title={titleIt("Take Part")} disabled><TabTakePart/></Tab>
      <Tab eventKey={3} title={titleIt("Chemical Services")} disabled><TabChemical/></Tab>
      <Tab eventKey={4} title={titleIt("Screening Services")} disabled><TabScreening/></Tab>
      <Tab eventKey={5} title={titleIt("About ComPlat")} disabled><TabAbout/></Tab>
      <Tab eventKey={6} title={titleIt("Contact Us")}><TabContact/></Tab>
    </Tabs>
  )
}

TabsMenu.propTypes = {

}

export default TabsMenu;
