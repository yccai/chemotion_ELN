import React from 'react';
import {Button, Tooltip, OverlayTrigger} from 'react-bootstrap';
import UIStore from 'components/stores/UIStore';
import ElementActions from 'components/actions/ElementActions';

export default class ReportButton extends React.Component {
  render() {
    const tooltip = (
      <Tooltip id="report_button">Generate report</Tooltip>
    );
    return (
      <OverlayTrigger placement="bottom" overlay={tooltip}>
        <Button bsStyle="success" onClick={e => this._splitSelectionAsSubsamples()} >
          <i className="fa fa-cogs"></i>
        </Button>
      </OverlayTrigger>
    )
  }
}
