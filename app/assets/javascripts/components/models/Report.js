import Element from './Element';

export default class Report extends Element {
  static buildEmpty() {
    let report = new Report({
      type: 'report',
      name: 'New Report' + new Date(),
      description: '',
      elements: []
    });

    return report;
  }
}
