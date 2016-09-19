import React from 'react'
import {Modal} from 'react-bootstrap'

import HomeStore from './stores/HomeStore'
import HomeActions from './actions/HomeActions'
import MyCompounds from './MyCompounds'
import MyScreenings from './MyScreenings'

const MyActivitiesModal = () => {

  const {showMyActivities, activityType} = HomeStore.getState();

  return (
    <Modal animation={false} show={showMyActivities} onHide={HomeActions.hideMyActivities}>
      <Modal.Header closeButton>
        <Modal.Title>{'My '+activityType+'s'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(activityType == 'Compound') ? <MyCompounds/> : null }
        {(activityType == 'Screening') ? <MyScreenings/> : null }
      </Modal.Body>
    </Modal>
  )
}

MyActivitiesModal.propTypes = {

}

export default MyActivitiesModal;
