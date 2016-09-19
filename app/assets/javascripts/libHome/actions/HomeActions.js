import alt from '../../components/alt';

// An element object has a type and an id, e.g., {type: 'sample', id: 1}
class HomeActions {
  selectMyActivities(e){
    return e
  }

  hideMyActivities(){
    return null
  }

}

export default alt.createActions(HomeActions);
