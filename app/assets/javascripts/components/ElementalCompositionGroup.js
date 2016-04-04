import React, {Component} from 'react';
import {Input, ListGroup, ListGroupItem, Button} from 'react-bootstrap';
import ElementalComposition from './ElementalComposition'
import ElementalCompositionCustom from './ElementalCompositionCustom'

export default class ElementalCompositionGroup extends React.Component {

  render() {
    let {sample} = this.props;
    let elemental_compositions = sample.elemental_compositions;

    let data_empty = true;
    let data = [];
    let el_composition_custom;

    elemental_compositions.map((elemental_composition, key) => {
      if(Object.keys(elemental_composition.data).length)
        data_empty = false;

      if(elemental_composition.composition_type == 'found') {
        el_composition_custom = elemental_composition;
      } else {
        data.push(
          <ElementalComposition
          elemental_composition={elemental_composition}
          key={elemental_composition.id}/>
        );
      }
    });

    if(data_empty) {
      data = (
        <p>
          Sorry, it was not possible to calculate the elemental
          compositon. Check data please.
        </p>
      )
    } else if(sample.formulaChanged) {
      data = (
        <p>
          Formula has been changed. Please save sample to calculate the
          elemental compositon.
        </p>
      )
    }

    if (sample.isNew) {
      return false;
    } else {
      return (
        <div>
          <label>Elemental composition</label>
          {data}
          <ElementalCompositionCustom
            elemental_composition={el_composition_custom}
            key={'elem_composition_found'}/>
        </div>
      )
    }
  }
}
