import Element from './Element';

export default class Report extends Element {
  static buildEmpty() {
    return new Report({
      type: 'report',
      name: 'New Report',
      reactions: []
    })
  }
}
