import 'whatwg-fetch';
import BaseFetcher from './BaseFetcher';

export default class MoleculesFetcher {
  static fetchByMolfile(molfile) {
    let promise = fetch('/api/v1/molecules', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        molfile: molfile
      })
    }).then((response) => {
      return response.json()
    }).then((json) => {
      return json;
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });

    return promise;
  }

  static fetchMoleculeNames() {
    return BaseFetcher.withoutBodyData({
      apiEndpoint: '/api/v1/molecules/names/',
      requestMethod: 'GET',
      responseTranformation: (response) => { return response.json() }
    });
  }
}
