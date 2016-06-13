import React, {Component} from 'react';
import SampleDetails from './SampleDetails';
import ReactionDetails from './ReactionDetails';
import WellplateDetails from './WellplateDetails';
import ScreenDetails from './ScreenDetails';
import ReportDetails from './ReportDetails';

export default class ElementDetails extends Component {
  render() {
    const {currentElement} =  this.props;
    switch (currentElement.type) {
      case 'sample':
        return <SampleDetails sample={currentElement}/>;
      case 'reaction':
        return <ReactionDetails reaction={currentElement}/>;
      case 'wellplate':
        return <WellplateDetails wellplate={currentElement}/>;
      case 'screen':
        return <ScreenDetails screen={currentElement}/>;
      case 'report':
        return <ReportDetails report={currentElement}/>;
    }
  }
}
