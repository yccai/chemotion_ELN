import React, {Component} from 'react';
import {Row, Col, Input, ListGroupItem, ListGroup} from 'react-bootstrap'
import Select from 'react-select'
import {solventOptions, purificationOptions, statusOptions, dangerousProductsOptions}
  from './staticDropdownOptions/options';
import DateTimeField from 'react-bootstrap-datetimepicker';
import moment from "moment";
export default class ReactionDetailsProperties extends Component {

  constructor(props) {
    super(props);
    const {reaction} = props;
    this.state = { reaction };
  }

  componentWillReceiveProps(nextProps) {
    const {reaction} = this.state;
    const nextReaction = nextProps.reaction;
    this.setState({ reaction: nextReaction });
  }

  handleInputChange(type, event) {
    const {onReactionChange} = this.props;
    const {value} = event.target;
    const {reaction} = this.state;
    let options = {};

    switch (type) {
      case 'name':
        reaction.name = value;
        break;
      case 'observation':
        reaction.observation = value;
        break;
      case 'status':
        reaction.status = value;
        break;
      case 'description':
        reaction.description = value;
        break;
      case 'purification':
        reaction.purification = value;
        break;
      case 'solvents':
        reaction.solvents = value;
        break;
      case 'rfValue':
        reaction.rf_value = value;
        break;
      case 'tlcDescription':
        reaction.tlc_description = value;
        break;
      case 'temperature':
        reaction.temperature = value;
        options = {schemaChanged: true}
        break;
      case 'dangerousProducts':
        reaction.dangerous_products = value;
        break;
        case 'solvent':
          reaction.solvent = value;
          options = {schemaChanged: true}
          break;
    }

    onReactionChange(reaction, options);
  }

  handleMultiselectChange(type, selectedOptions) {
    const values = selectedOptions.map(option => option.value);
    const wrappedEvent = {target: {value: values}};
    this.handleInputChange(type, wrappedEvent)
  }

  handleTimeChange(type, date) {
    const {onReactionChange} = this.props;
    let {reaction} = this.state;
    switch (type) {
      case 'timestampStart':
        reaction.timestamp_start = date;
        break;
      case 'timestampStop':
        reaction.timestamp_stop = date;
        break;
    }
    onReactionChange(reaction);
  }

  dateTimeField(type, value) {
    if (value != null && value != "") {
      return (
        <DateTimeField
          dateTime={value}
          onChange={event => this.handleTimeChange('timestamp'+type, event)}
        />
      )
    } else {
      return (
        <DateTimeField
          defaultText={"Please select a date"}
          onChange={event => this.handleTimeChange('timestamp'+type, event)}
        />
      )
    }
  }

  render() {
    const {reaction} = this.state;
    return (
      <ListGroup>
        <ListGroupItem header="">
          <Row>
            <Col md={6}>
              <Input
                type="text"
                label="Name"
                value={reaction.name}
                placeholder="Name..."
                onChange={event => this.handleInputChange('name', event)}/>
            </Col>
            <Col md={6}>
              <label>Status</label>
              <Select
                name='status'
                multi={false}
                options={statusOptions}
                value={reaction.status}
                onChange={event => {
                  const wrappedEvent = {target: {value: event}};
                  this.handleInputChange('status', wrappedEvent)
                }}
                />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Input
                type="textarea"
                label="Description"
                value={reaction.description}
                placeholder="Description..."
                onChange={event => this.handleInputChange('description', event)}/>
            </Col>
          </Row>
        </ListGroupItem>
        <ListGroupItem header="">
          <Row>
            <Col md={4}>
              <label>Solvent</label>
              <Select
                name='solvent'
                multi={false}
                options={solventOptions}
                value={reaction.solvent}
                onChange={event => {
                  const wrappedEvent = {target: {value: event}};
                  this.handleInputChange('solvent', wrappedEvent)
                }}
              />
            </Col>
            <Col md={4}>
              <b>Start</b>
              {this.dateTimeField('Start', reaction.timestamp_start)}
            </Col>
            <Col md={4}>
              <b>Stop</b>
              {this.dateTimeField('Stop', reaction.timestamp_stop)}
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Input
                type="textarea"
                label="Observation"
                value={reaction.observation}
                placeholder="Observation..."
                onChange={event => this.handleInputChange('observation', event)}/>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <label>Purification</label>
              <Select
                name='purification'
                multi={true}
                options={purificationOptions}
                onChange={(event, selectedOptions) =>
                  this.handleMultiselectChange('purification', selectedOptions)}
                value={reaction.purification}
                />
            </Col>
            <Col md={6}>
              <label>Dangerous Products</label>
              <Select
                name='dangerous_products'
                multi={true}
                options={dangerousProductsOptions}
                value={reaction.dangerous_products}
                onChange={(event, selectedOptions) =>
                  this.handleMultiselectChange('dangerousProducts', selectedOptions)}
              />
            </Col>
          </Row>
        </ListGroupItem>
        <ListGroupItem header="TLC-Control">
          <Row>
            <Col md={6}>
              <Input
                type="text"
                label="Solvents (parts)"
                value={reaction.solvents}
                placeholder="Solvents as parts..."
                onChange={event => this.handleInputChange('solvents', event)}/>
            </Col>
            <Col md={3}>
              <Input
                type="text"
                label="Rf-Value"
                value={reaction.rf_value}
                placeholder="Rf-Value..."
                onChange={event => this.handleInputChange('rfValue', event)}/>
            </Col>
            <Col md={3}>
              <Input
                type="text"
                label="Temperature"
                value={reaction.temperature}
                placeholder="Temperature..."
                onChange={event => this.handleInputChange('temperature', event)}/>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Input
                type="textarea"
                label="TLC-Description"
                value={reaction.tlc_description}
                placeholder="TLC-Description..."
                onChange={event => this.handleInputChange('tlcDescription', event)}/>
            </Col>
          </Row>
        </ListGroupItem>
      </ListGroup>
    );
  }
}
