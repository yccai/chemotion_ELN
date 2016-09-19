import React from 'react'
import {Jumbotron, Col, Row} from 'react-bootstrap'

const TabContact = () => {

  return(
    <div >
      <br/><br/><br/>

      <Jumbotron style={{width:'90%', margin:'auto'}}>
        <Row>
          <Col md={6}>
            <table style={{width:'80%', height:400, margin:'auto'}}><tbody>
              <tr><td><h3>Compound Platform (ComPlat)</h3><br/><br/></td></tr>
              <tr><td>Institute of Toxicology and Genetics (ITG)</td></tr>
              <tr><td>Hermann-von-Helmholtz-Platz 1</td></tr>
              <tr><td>Building 341; Room 155</td></tr>
              <tr><td>76344 Eggenstein-Leopoldshafen</td></tr>
              <tr><td>Germany<br/><br/></td></tr>
              <tr><td><i className="fa fa-phone" aria-hidden="true"/> +49 721 608 24697</td></tr>
              <tr><td><i className="fa fa-envelope" aria-hidden="true"/> complat<i className="fa fa-at" aria-hidden="true"/>ioc.kit.edu</td></tr>
            </tbody></table>
          </Col>
          <Col md={6}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2612.4795306481205!2d8.428392315993667!3d49.09652997931155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDnCsDA1JzQ3LjUiTiA4wrAyNSc1MC4xIkU!5e0!3m2!1sde!2sde!4v1473947291352"
              style={{width:'80%', height:400, frameborder:"0", margin:'auto'}}/>
          </Col>
        </Row>
      </Jumbotron>


      <br/><br/><br/>
    </div>
  )
}

TabContact.propTypes = {

}

export default TabContact;
