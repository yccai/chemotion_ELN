import React from 'react';
import {Button, ButtonToolbar, Input, Modal, Panel} from 'react-bootstrap';
import Select from 'react-select';

import Aviator from 'aviator';

export default class StructureEditorModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: props.showModal,
      showWarning: props.hasChildren || props.hasParent,
      molfile: props.molfile
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      showModal: nextProps.showModal,
      molfile: nextProps.molfile
    })
  }

  getKetcher() {
    let ketcherFrame = document.getElementById("ifKetcher");
    let ketcher = null;

    if (ketcherFrame && ("contentDocument" in ketcherFrame))
      ketcher = ketcherFrame.contentWindow.ketcher;
    else
      ketcher = document.frames['ifKetcher'].window.ketcher;

    return ketcher;
  }

  initializeEditor() {
    var ketcher = this.getKetcher();

    let molfile = this.state.molfile;
    ketcher.setMolecule(molfile);
  }

  getMolfileFromEditor() {
    var ketcher = this.getKetcher();

    return ketcher.getMolfile();
  }

  getSVGFromEditor() {
    var ketcher = this.getKetcher();

    return ketcher.getSVG();
  }

  handleCancelBtn() {
    this.hideModal();
    if(this.props.onCancel) {
      this.props.onCancel()
    }
  }

  handleSaveBtn() {
    let molfile = this.getMolfileFromEditor()
    let svg_file = this.getSVGFromEditor()
    this.hideModal();
    if(this.props.onSave) {
      this.props.onSave(molfile, svg_file)
    }
  }

  hideModal() {
    this.setState({
      showModal: false,
      showWarning: this.props.hasChildren || this.props.hasParent
    })
  }

  hideWarning() {
    this.setState({
      showWarning: false
    })
  }
  // TODO: can we catch the ketcher on draw event, instead on close button click?
  // This woul allow us to show molecule information to the user while he draws,
  //  e.g. the IUPAC name
  // and would give a feedback if the structure is valid or not

  render() {
    let editorContent = this.state.showWarning ?
      <WarningBox handleCancelBtn={this.handleCancelBtn.bind(this)}
                  hideWarning={this.hideWarning.bind(this)} />
      :
      <StructureEditor
        handleCancelBtn = { this.handleCancelBtn.bind(this) }
        handleSaveBtn = { this.handleSaveBtn.bind(this) }
        cancelBtnText = {
          this.props.cancelBtnText ? this.props.cancelBtnText : "Cancel"
        }
        submitBtnText = {
          this.props.submitBtnText ? this.props.submitBtnText : "Save"
        }
        submitAddons = {
          this.props.submitAddons ? this.props.submitAddons : ""
        }
      />

    let dom_class = this.state.showWarning ? "" : "structure-editor-modal"
    return (
      <div>
        <Modal dialogClassName={dom_class}
          animation show={this.state.showModal}
          onLoad={this.initializeEditor.bind(this)}
          onHide={this.handleCancelBtn.bind(this)}>

          <Modal.Header closeButton>
            <Modal.Title>Structure Editor</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editorContent}
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

const StructureEditor =
  ({handleCancelBtn, handleSaveBtn, cancelBtnText, submitBtnText, submitAddons}) => {
    let height = window.innerHeight;
    let minHeight = 590;//min table height is 590px, each <tr> is 36px
    let add_tr_count = ((height*0.75 - minHeight)/36).toFixed();// 75% screen
    add_tr_count = add_tr_count < 0 ? 0 : add_tr_count
    if(add_tr_count > 2) add_tr_count -= 2;
    let adjustedHeight = add_tr_count*36 + minHeight;
    return (
      <div>
        <div>
          <iframe id="ifKetcher"
                  style={{height: adjustedHeight }}
                  src={"/ketcher?height=" + height + "&add_tr_count=" + add_tr_count }>
          </iframe>
        </div>
        <div>
          <ButtonToolbar>
            <Button bsStyle="warning" onClick={handleCancelBtn}>
              {cancelBtnText}
            </Button>
            <Button bsStyle="primary" onClick={handleSaveBtn}>
              {submitBtnText}
            </Button>
            {submitAddons}
          </ButtonToolbar>
        </div>
      </div>
    )
  }

const WarningBox = ({handleCancelBtn, hideWarning}) => {
  return (
    <Panel header="Parents/Descendants will not be changed!" bsStyle="info">
      <p>This sample has parents or descendants, and they will not be changed.</p>
      <p>Are you sure?</p>
      <br />
      <Button bsStyle="danger" onClick={handleCancelBtn}
        className="g-marginLeft--10">
        Cancel
      </Button>
      <Button bsStyle="warning" onClick={hideWarning}
        className="g-marginLeft--10">
        Continue Editing
      </Button>
    </Panel>
  )
}
