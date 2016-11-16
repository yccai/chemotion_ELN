import React, {Component} from 'react';
import {ListGroup, ListGroupItem, Button, ButtonToolbar, Well} from 'react-bootstrap';
import ContainerDatasetModal from './ContainerDatasetModal';
import Container from './models/Container';

export default class ContainerDatasets extends Component {
  constructor(props) {
    super();
    const {container} = props;
    this.state = {
      container,
      modal: {
        show: false,
        dataset_container: null
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      container: nextProps.container
    })
  }

  handleModalOpen(dataset_container) {
    const {modal} = this.state;
    modal.dataset_container = dataset_container;
    modal.show = true;
    this.setState({modal});
  }

  handleAdd(){
    const {container} = this.state;
    let dataset_container = Container.buildEmpty();
    container.children.push(dataset_container);

    this.handleModalOpen(dataset_container);
    this.props.onChange(container);

  }

  handleRemove(dataset_container) {
    let {container} = this.state;

    //const index = container.children.indexOf(dataset_container);
    //container.children.splice(index, 1);
    dataset_container.is_deleted = true;

    this.props.onChange(container);
  }

  handleChange(dataset_container){
    let {container} = this.state;

    container.children.find(dataset => {
      if(dataset.id == dataset_container.id) {
        const datasetId = container.children.indexOf(dataset);
        container.children[datasetId] = dataset_container;
      }
    });

    this.props.onChange(container);
  }

  handleModalHide() {
    const {modal} = this.state;
    modal.show = false;
    modal.dataset_container = null;
    this.setState({modal});
    // https://github.com/react-bootstrap/react-bootstrap/issues/1137
    document.body.className = document.body.className.replace('modal-open', '');
  }

  addButton() {
    const {readOnly} = this.props;
    if(!readOnly) {
      return (
        <div className="pull-right" style={{marginTop: 5, marginBottom: 5}}>
          <Button bsSize="xsmall" bsStyle="success" onClick={() => this.handleAdd()}>
            <i className="fa fa-plus"></i>
          </Button>
        </div>
      )
    }
  }

  removeButton(dataset_container) {
    const {readOnly} = this.props;
    if(!readOnly) {
      return (
        <Button bsSize="xsmall" bsStyle="danger" onClick={() => this.handleRemove(dataset_container)}>
          <i className="fa fa-trash-o"></i>
        </Button>
      );
    }
  }

  render() {
    const {container, modal} = this.state;
    if(container.children.length > 0) {
      return (
        <div>
          <Well style={{minHeight: 70, padding: 5, paddingBottom: 31}}>
            <ListGroup style={{marginBottom: 0}}>
              {container.children.map((dataset_container, key) => {
                return (
                  <ListGroupItem key={key}>
                    <a style={{cursor: 'pointer'}} onClick={() => this.handleModalOpen(dataset_container)}>
                      {dataset_container.name}
                    </a>
                    <ButtonToolbar className="pull-right">
                      <Button bsSize="xsmall" bsStyle="info" onClick={() => alert("zip download not implemented yet.")}>
                        <i className="fa fa-download"></i>
                      </Button>
                      {this.removeButton(dataset_container)}
                    </ButtonToolbar>
                  </ListGroupItem>
                )
              })}
            </ListGroup>
            {this.addButton()}
          </Well>
          <ContainerDatasetModal
            onHide={() => this.handleModalHide()}
            onChange = {dataset_container => this.handleChange(dataset_container)}
            show={modal.show}
            readOnly={this.props.readOnly}
            dataset_container={modal.dataset_container}
            />
        </div>
      );
    } else {
      return(
        <div>
          <Well style={{minHeight: 70, padding: 10}}>
            There are currently no Datasets.<br/>
            {this.addButton()}
          </Well>
        </div>
      )
    }
  }
}
