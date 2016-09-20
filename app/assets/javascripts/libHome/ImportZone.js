import React from 'react';
import {Button, ButtonToolbar, Input} from 'react-bootstrap';
import Dropzone from 'react-dropzone';


import NotificationActions from '../components/actions/NotificationActions';

export default class ImportZone extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null
    };
  }

  handleClick() {
    const {file} = this.state;

    let params = {
      file: file,
    }
    action(params);
    onHide();

    let notification = {
      title: "Uploading",
      message: "The file is being processed. Please wait...",
      level: "warning",
      dismissible: false,
      uid: "import_samples_upload",
      position: "bl"
    }

    NotificationActions.add(notification);
  }

  handleFileDrop(attachment_file) {
    this.setState({file: attachment_file[0]});
  }

  handleAttachmentRemove() {
    this.setState({file: null});
  }

  dropzoneOrfilePreview() {
    const {file} = this.state;
    if (file) {
      return (
        <div>
          {file.name}
          <Button bsSize="xsmall" bsStyle="danger" onClick={() => this.handleAttachmentRemove()} className="pull-right">
            <i className="fa fa-trash-o"></i>
          </Button>
        </div>
      );
    } else {
      return (
        <Dropzone
          onDrop={attachment_file => this.handleFileDrop(attachment_file)}
          style={{height: 50, width: '100%', border: '3px dashed lightgray'}}
          >
          <div style={{textAlign: 'center', paddingTop: 12, color: 'gray'}}>
            Drop File, or Click to Select.
          </div>
        </Dropzone>
      );
    }
  }

  isDisabled() {
    const {file} = this.state;
    return file == null
  }

  render() {
    const {onHide} = this.props;
    return (
      <div>
        {this.dropzoneOrfilePreview()}
        &nbsp;
        <ButtonToolbar>
          <Button bsStyle="primary" onClick={() => onHide()}>Cancel</Button>
          <Button bsStyle="warning" onClick={() => this.handleClick()} disabled={this.isDisabled()}>Import</Button>
        </ButtonToolbar>
      </div>
    )
  }
}
