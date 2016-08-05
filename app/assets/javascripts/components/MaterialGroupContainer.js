import React, {Component, PropTypes} from 'react';
import {DropTarget} from 'react-dnd';
import DragDropItemTypes from './DragDropItemTypes';
import MaterialGroup from './MaterialGroup';

const target = {
  drop(props, monitor){
    const {dropSample, dropMaterial, materialGroup} = props;
    const item = monitor.getItem();
    const itemType = monitor.getItemType();
    if (itemType == 'sample') {
      dropSample(item.element, materialGroup);
    } else if (itemType == 'material') {
      dropMaterial(item.material, item.materialGroup, materialGroup);
    }
  },
  canDrop(props, monitor){
    const {materialGroup} = props;
    const item = monitor.getItem();
    const itemType = monitor.getItemType();
    if (itemType == 'material' && item.materialGroup != materialGroup) {
      return true;
    } else if (itemType == 'sample') {
      return true;
    }
  }
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
});

class MaterialGroupContainer extends Component {
  render() {
    const {materials, materialGroup, isOver, canDrop, connectDropTarget,
           showLoadingColumn, deleteMaterial, onChange, isLockEq} = this.props;
    let style = {
      padding: 10
    };
    if (isOver && canDrop) {
      style.borderStyle = 'dashed';
      style.borderColor = '#337ab7';
    } else if (canDrop) {
      style.borderStyle = 'dashed';
    }
    return connectDropTarget(
      <div style={style}>
        <MaterialGroup
          onChange={onChange}
          materials={materials}
          materialGroup={materialGroup}
          showLoadingColumn={showLoadingColumn}
          deleteMaterial={deleteMaterial}
          isLockEq={isLockEq}
          />
      </div>
    );
  }
}

export default DropTarget([DragDropItemTypes.SAMPLE, DragDropItemTypes.MATERIAL], target, collect)(MaterialGroupContainer);

MaterialGroupContainer.propTypes = {
  materials: PropTypes.array.isRequired,
  materialGroup: PropTypes.string.isRequired,
  deleteMaterial: PropTypes.func.isRequired,
  isLockEq: PropTypes.bool.isRequired
};
