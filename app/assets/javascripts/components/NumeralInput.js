import React, {Component} from 'react';
import Numeral from 'numeral';
import {Input} from 'react-bootstrap';

export default class NumeralInput extends Component {
  constructor(props) {
    super(props);

    let {value} = props;
    this.state = {
      numeralValue: this._convertValueToNumeralValue(value)
    };
  }

  componentWillReceiveProps(nextProps) {
    let {value} = nextProps;
    this.setState({
      numeralValue: this._convertValueToNumeralValue(value)
    });
  }

  _convertValueToNumeralValue(value) {
    let {numeralFormat} = this.props;
    let numeralValue = null;

    try {
      numeralValue = Numeral(value).format(numeralFormat);
    } catch(err) {
      console.log('Error in NumeralInput component: ' + err)
    }

    return numeralValue;
  }

  //TODO fix issue that cursor is behind, when numeral inserts a comma:
  // containing comas need to be compared to previous amount
  _handleInputValueChange(event) {
    let inputField = event.target;
    let caretPosition = $(inputField).caret();
    let {value} = inputField;
    let formatedValue = this._convertValueToNumeralValue(value);
    let unformatedValue = Numeral().unformat(formatedValue);
    let {onChange} = this.props;

    this.setState({
        numeralValue: formatedValue
      }, () => {
        $(inputField).caret(caretPosition);
      }
    );
    onChange(unformatedValue);
  }

  render() {
    let {bsSize, bsStyle, addonAfter, buttonAfter, label, disabled} = this.props;
    let {numeralValue} = this.state;
    return (
      <Input type='text' label={label} value={numeralValue} bsSize={bsSize}
       bsStyle={bsStyle} addonAfter={addonAfter} buttonAfter={buttonAfter}
       disabled={disabled} onChange={ event => this._handleInputValueChange(event)}/>
    );
  }
}

NumeralInput.defaultProps = {
  numeralFormat: '',
  value: 0,
  onChange: () => {
  }
};
