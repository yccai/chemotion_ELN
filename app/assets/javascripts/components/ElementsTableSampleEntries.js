import React, {Component} from 'react'
import {Table} from 'react-bootstrap'
import ElementCheckbox from './ElementCheckbox'
import SVG from 'react-inlinesvg'
import ElementCollectionLabels from './ElementCollectionLabels'
import ElementAnalysesLabels from './ElementAnalysesLabels'
import ElementReactionLabels from './ElementReactionLabels'
import ArrayUtils from './utils/ArrayUtils'
import {Tooltip, OverlayTrigger} from 'react-bootstrap'
import ElementContainer from './ElementContainer'

import UIStore from './stores/UIStore';
import ElementStore from './stores/ElementStore';
import KeyboardStore from './stores/KeyboardStore';

import DragDropItemTypes from './DragDropItemTypes';
import SampleName from './common/SampleName'
import XMolHeadCont from "./extra/ElementsTableSampleEntriesXMolHeadCont";
import Sample from './models/Sample'


export default class ElementsTableSampleEntries extends Component {
  constructor(props) {
    super()
    this.state = {
      moleculeGroupsShown: [],
      keyboardIndex: null,
      keyboardSeletectedElementId: null
    }

    this.sampleOnKeyDown = this.sampleOnKeyDown.bind(this)
  }

  componentDidMount() {
    KeyboardStore.listen(this.sampleOnKeyDown)
  }

  componentWillReceiveProps(nextProps) {
    let flattenSamplesId = []
    let flatIndex = 0
    nextProps.elements.forEach(function(groupSample, index) {
      for (let i = 0; i < groupSample.length; i++) {
        flattenSamplesId[flatIndex + i] = groupSample[i].id
      }

      flatIndex = flatIndex + groupSample.length
    }, [])
    this.flattenSamplesId = flattenSamplesId
  }

  componentWillUnmount() {
    KeyboardStore.unlisten(this.sampleOnKeyDown)
  }

  sampleOnKeyDown(state) {
    let context = state.context
    if (context != "sample") return false

    let documentKeyDownCode = state.documentKeyDownCode
    let {keyboardIndex, keyboardSeletectedElementId} = this.state

    switch(documentKeyDownCode) {
      case 13: // Enter
      case 39: // Right
        if (keyboardIndex != null && keyboardSeletectedElementId != null) {
          this.showDetails(keyboardSeletectedElementId)
        }
        break
      case 38: // Up
        if (keyboardIndex > 0) {
          keyboardIndex--
        } else {
          keyboardIndex = 0
        }
        break
      case 40: // Down
        if (keyboardIndex == null) {
          keyboardIndex = 0
        } else if (keyboardIndex < (this.flattenSamplesId.length - 1)){
          keyboardIndex++
        }

        break
    }

    keyboardSeletectedElementId = this.flattenSamplesId[keyboardIndex]
    this.setState({
      keyboardIndex: keyboardIndex,
      keyboardSeletectedElementId: keyboardSeletectedElementId
    })
  }

  render() {
    let {elements: samples, currentElement, showDragColumn, ui} = this.props

    return (
      <Table className="elements" bordered hover style={{borderTop: 0}}>
        {Object.keys(samples).map((group, index) => {
          let moleculeGroup = samples[group]
          return this.renderMoleculeGroup(moleculeGroup, index)
        })}
      </Table>
    )
  }

  renderMoleculeGroup(moleculeGroup, index) {
    let {moleculeGroupsShown} = this.state
    let moleculeName = moleculeGroup[0].molecule.iupac_name || moleculeGroup[0].molecule.inchistring
    let showGroup = !moleculeGroupsShown.includes(moleculeName)
    return (
      <tbody key={index}>
        {this.renderMoleculeHeader(moleculeGroup[0], showGroup)}
        {this.renderSamples(moleculeGroup, showGroup)}
      </tbody>
    )
  }

  renderMoleculeHeader(sample, show) {
    let {molecule} = sample
    let showIndicator = (show) ? 'glyphicon-chevron-down' : 'glyphicon-chevron-right'

    let tdExtraContents = [];

    for (let j=0;j < XMolHeadCont.MolHeadContCount;j++){
      let NoName = XMolHeadCont["MolHeadCont"+j];
      tdExtraContents.push(<NoName element={sample} key={"exMolHead"+j}/>);
    }
    let dragItem;
    // in molecule dnd we use sample if molecule is a partial
    if(sample.contains_residues) {
      const {collId} = UIStore.getState()
      dragItem = Sample.copyFromSampleAndCollectionId(sample, collId, true);
      dragItem.id = null;
    } else {
      dragItem = molecule;
    }

    return (
      <tr
        style={{backgroundColor: '#F5F5F5', cursor: 'pointer'}}
        onClick={() => this.handleMoleculeToggle(molecule.iupac_name || molecule.inchistring)}
      >
        <td colSpan="2" style={{position: 'relative'}}>
          <div style={{float: 'left'}}>
            <SVG src={sample.svgPath} className="molecule" key={sample.svgPath}/>
          </div>
          <div style={{position: 'absolute', float: 'right', right: '3px'}}>
            <OverlayTrigger placement="bottom" overlay={<Tooltip id="toggle_molecule">Toggle Molecule</Tooltip>}>
              <span style={{fontSize: 15, color: '#337ab7', lineHeight: '10px'}}>
                <i className={`glyphicon ${showIndicator}`}></i>
              </span>
            </OverlayTrigger>
          </div>
          <div style={{paddingLeft: 5, wordWrap: 'break-word'}}>
            <h4><SampleName sample={sample}/></h4>
          </div>

          {tdExtraContents.map((e)=>{return e;})}
        </td>
          {this.dragColumn(dragItem)}
      </tr>
    )
  }

  renderSamples(samples, show) {
    let {keyboardSeletectedElementId} = this.state

    if(show) {
      return samples.map((sample, index) => {
        let style = {}

        if (this.isElementSelected(sample) || keyboardSeletectedElementId == sample.id) {
          style = {color: '#fff', background: '#337ab7'}
        }

        return (
          <tr key={index} style={style}>
            <td width="30px">
              <ElementCheckbox element={sample} key={sample.id} checked={this.isElementChecked(sample)}/>
            </td>
            <td style={{cursor: 'pointer'}}
                onClick={() => this.showDetails(sample.id)}>
              {sample.title() + " "}
              <div style={{float: 'right'}}>
                <ElementReactionLabels element={sample} key={sample.id + "_reactions"}/>
                <ElementCollectionLabels element={sample} key={sample.id}/>
                <ElementAnalysesLabels element={sample} key={sample.id+"_analyses"}/>
                {this.topSecretIcon(sample)}
              </div>
            </td>
            {this.dragColumn(sample)}
          </tr>
        )
      })
    } else {
      return null
    }
  }

  handleMoleculeToggle(moleculeName) {
    let {moleculeGroupsShown} = this.state
    if(!moleculeGroupsShown.includes(moleculeName)) {
      moleculeGroupsShown = moleculeGroupsShown.concat(moleculeName)
    } else {
      moleculeGroupsShown = moleculeGroupsShown.filter(item => item !== moleculeName)
    }
    this.setState({moleculeGroupsShown})
  }

  dragColumn(element) {
    const {showDragColumn} = this.props
    if(showDragColumn) {
      return (
        <td style={{verticalAlign: 'middle', textAlign: 'center'}}>
          {this.dragHandle(element)}
        </td>
      );
    } else {
      return null
    }
  }

  dragHandle(element) {
    let sourceType = this.isCurrentElementDropTargetForType('sample')
      ? sourceType = DragDropItemTypes.SAMPLE
      : ""
    return <ElementContainer key={element.id} sourceType={sourceType} element={element}/>
  }

  isCurrentElementDropTargetForType(type) {
    const {currentElement} = ElementStore.getState()
    const targets = {
      sample: ['reaction', 'wellplate']
    };
    return type && currentElement && targets[type].includes(currentElement.type)
  }

  showDetails(id) {
    const {currentCollection,isSync} = UIStore.getState()
    Aviator.navigate(isSync
      ? `/scollection/${currentCollection.id}/sample/${id}`
      : `/collection/${currentCollection.id}/sample/${id}`
    );
  }

  topSecretIcon(element) {
    if (element.type == 'sample' && element.is_top_secret == true) {
      const tooltip = (<Tooltip id="top_secret_icon">Top secret</Tooltip>);
      return (
        <OverlayTrigger placement="top" overlay={tooltip}>
          <i className="fa fa-user-secret"></i>
        </OverlayTrigger>
      )
    }
  }

  isElementChecked(element) {
    let {checkedIds, uncheckedIds, checkedAll} = this.props.ui;
    return (checkedAll && ArrayUtils.isValNotInArray(uncheckedIds || [], element.id))
      || ArrayUtils.isValInArray(checkedIds || [], element.id);
  }

  isElementSelected(element) {
    const {currentElement} = this.props
    return (currentElement && currentElement.id == element.id);
  }
}
