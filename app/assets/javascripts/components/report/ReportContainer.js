import React, {Component} from 'react'
import {Panel, Button, Tabs, Tab, Row, Col,
        Tooltip, OverlayTrigger} from 'react-bootstrap';
import StickyDiv from 'react-stickydiv'
import Aviator from 'aviator';

import ReportActions from '../actions/ReportActions';
import ReportStore from '../stores/ReportStore';
import UIActions from '../actions/UIActions';
import UIStore from '../stores/UIStore';

import Reports from './Reports';
import Orders from './Orders';
import CheckBoxs from '../common/CheckBoxs';
import Select from 'react-select';

export default class ReportContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...ReportStore.getState(),
    }
    this.onChange = this.onChange.bind(this);
    this.onChangeUI = this.onChangeUI.bind(this);
  }

  componentDidMount() {
    ReportStore.listen(this.onChange)
    UIStore.listen(this.onChangeUI)
    UIActions.selectTab.defer(2)
  }

  componentWillUnmount() {
    ReportStore.unlisten(this.onChange)
    UIStore.unlisten(this.onChangeUI)
  }

  onChange(state) {
    this.setState({...state})
  }

  onChangeUI(state) {
    const checkedIds = state['reaction'].checkedIds.toArray()
    ReportActions.updateCheckedIds.defer(checkedIds);
  }

  handleImgFormatChanged(e) {
    ReportActions.updateImgFormat(e);
  }

  render() {
    const imgFormatOpts = [
      { label: 'PNG', value: 'png'},
      { label: 'EPS', value: 'eps'},
      { label: 'EMF', value: 'emf'}
    ];
    let EPSwarning = (this.state.imgFormat == 'eps')
                    ?
                      <p className="text-danger" style={{paddingTop: 12}}>
                        WARNING: EPS format is not supported by Microsoft Office
                      </p>
                    :
                      null;
    return (
      <Panel header="Report Generation"
             bsStyle="default">
        <div className="button-right">
          {this.generateReportsBtn()}
          <Button bsStyle="danger"
                  bsSize="xsmall"
                  className="g-marginLeft--10"
                  onClick={this.closeDetails.bind(this)}>
            <i className="fa fa-times"></i>
          </Button>
        </div>

        <Tabs defaultActiveKey={0} id="report-tabs" >
          <Tab eventKey={0} title={"Setting"}>
            <CheckBoxs  items={this.state.settings}
                        toggleCheckbox={this.toggleSettings}
                        toggleCheckAll={this.toggleSettingsAll}
                        checkedAll={this.state.checkedAllSettings} />
          </Tab>

          <Tab eventKey={1} title={"Config"}>
            <CheckBoxs  items={this.state.configs}
                        toggleCheckbox={this.toggleConfigs}
                        toggleCheckAll={this.toggleConfigsAll}
                        checkedAll={this.state.checkedAllConfigs} />
            <Row>
              <Col md={3} sm={8}>
                <label>Images format</label>
                <Select options={imgFormatOpts}
                        value={this.state.imgFormat}
                        clearable={false}
                        style={{width: 100}}
                        onChange={(e) => this.handleImgFormatChanged(e)}/>
              </Col>
              <Col md={9} sm={16}>
                <label></label>
                {EPSwarning}
              </Col>
            </Row>
          </Tab>

          <Tab eventKey={2} title={"Order"}>
            <div className="panel-fit-screen">
              <Orders selectedReactions={this.state.selectedReactions} />
            </div>
          </Tab>

          <Tab eventKey={3} title={"Report"}>
            <div className="panel-fit-screen">
              <Reports selectedReactions={this.state.selectedReactions}
                       settings={this.state.settings}
                       configs={this.state.configs} />
            </div>
          </Tab>
        </Tabs>

      </Panel>
    );
  }

  toggleSettings(text, checked){
    ReportActions.updateSettings({text, checked})
  }

  toggleConfigs(text, checked){
    ReportActions.updateConfigs({text, checked})
  }

  closeDetails() {
    UIActions.deselectAllElements();
    Aviator.navigate(`/collection/all`);
  }

  toggleSettingsAll() {
    ReportActions.toggleSettingsCheckAll()
  }

  toggleConfigsAll() {
    ReportActions.toggleConfigsCheckAll()
  }

  generateReports() {
    ReportActions.generateReports()
  }

  generateReportsBtn() {
    let showGeneReportBtnIds = this.state.selectedReactionIds.length !== 0 ? true : false
    let showGeneReportBtnSts = this.state.settings.map(setting => {
      if(setting.checked){
        return true
      }
    }).filter(r => r!=null).length !== 0 ? true : false

    return (
      !this.state.processingReport ?
      <Button bsStyle="primary"
              bsSize="xsmall"
              className="button-right"
              disabled={!(showGeneReportBtnSts && showGeneReportBtnIds)}
              onClick={this.generateReports.bind(this)}>
        <span><i className="fa fa-file-text-o"></i> Generate Report</span>
      </Button>
      :
      <Button bsStyle="danger"
              bsSize="xsmall"
              className="button-right">
        <span><i className="fa fa-spinner fa-pulse fa-fw"></i> Processing your report, please wait...</span>
      </Button>
    )
  }
}
