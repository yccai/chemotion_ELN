import React, {Component} from 'react';
import {Modal} from 'react-bootstrap';
import Dataset from './Dataset';

export default class DatasetModal extends Component {
  render() {
    const {show, dataset, onHide, onChange, readOnly} = this.props;
    if(show) {
      return (
        <div>
          <Modal animation show={show} bsSize="large" onHide={() => onHide()}>
            <Modal.Header closeButton>
              <Modal.Title>
                {dataset.name}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div>
                <Dataset
                  readOnly={readOnly}
                  dataset={dataset}
                  onModalHide={() => onHide()}
                  onChange={dataset => onChange(dataset)}
                  />
              </div>
            </Modal.Body>
          </Modal>
        </div>
      )
    } else {
      return <div></div>
    }
  }
}
