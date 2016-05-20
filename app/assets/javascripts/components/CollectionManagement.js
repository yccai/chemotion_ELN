import React from 'react';
import {Tabs, Tab, Button} from 'react-bootstrap';

import MyCollections from './collection_management/MyCollections';
import MySharedCollections from './collection_management/MySharedCollections';
import Aviator from 'aviator'

export default class CollectionManagement extends React.Component {
  constructor(props) {
    super(props);
  }

  closeView() {
    Aviator.navigate('/collection/all');
  }

  render() {
    return (
      <div id="collection-management">
        <Button className="pull-right btn-primary"
                onClick={this.closeView.bind(this)}>
          Close
        </Button>
        <Tabs defaultActiveKey={1} inverse>
          <Tab eventKey={1} title="My Collections">
            <MyCollections />
          </Tab>
          <Tab eventKey={2} title="My Shared Collections">
            <MySharedCollections />
          </Tab>
        </Tabs>
      </div>
    )
  }
}
