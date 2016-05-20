import React, {Component} from 'react';
import {DragDropContext} from 'react-dnd';
import {Col} from 'react-bootstrap';
import HTML5Backend from 'react-dnd-html5-backend';

import CollectionTree from './CollectionTree'
import List from './List';
import ElementDetails from './ElementDetails';
import ElementStore from './stores/ElementStore';

class MainTree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentElement: null
    };
  }

  componentWillMount() {
    ElementStore.listen(state => this.handleOnChange(state));
  }

  componentWillUnmount() {
    ElementStore.unlisten(state => this.handleOnChange(state));
  }

  handleOnChange(state) {
    const {currentElement} = state;
    this.setState({currentElement});
  }

  render() {
    const {currentElement} = this.state;
    const ctree = (<CollectionTree />);
    const list = (<List overview={!currentElement}/>);
    if (currentElement) {
      return (
        <div>
          <Col md={3}>
            {ctree}
            {list}
          </Col>
          <Col md={9}>
            <ElementDetails currentElement={currentElement}/>
          </Col>
        </div>
      )
    } else {
      return (
        <div>
          <Col md={3}>
            {ctree}
          </Col>
          <Col md={9}>
            {list}
          </Col>
        </div>
      );
    }
  }
}

export default DragDropContext(HTML5Backend)(MainTree);
