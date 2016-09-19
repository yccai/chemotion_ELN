import alt from '../../components/alt';

import HomeActions from '../actions/HomeActions'

class UIStore {
  constructor() {
    this.state = {
      showMyActivities: false,
      activityType:''
    }
    this.bindListeners({
      handleSelectMyActivities: HomeActions.selectMyActivities,
      handleHideMyActivities: HomeActions.hideMyActivities
    })
  }


  handleSelectMyActivities(e){
    this.setState({
      showMyActivities: true,
      activityType: e
    })
  }


  handleHideMyActivities(){
    this.setState({
      showMyActivities: false,
      activityType: '',
    })
  }

}

export default alt.createStore(UIStore, 'UIStore');
