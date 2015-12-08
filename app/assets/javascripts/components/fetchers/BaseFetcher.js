import 'whatwg-fetch';

export default class BaseFetcher {
  /**
   * @param {Object} params = { apiEndpoint, requestMethod, bodyData, responseTranformation }
   */
  static withBodyData(params) {
    const { apiEndpoint, requestMethod, bodyData, responseTranformation } = params;
    let promise = fetch(apiEndpoint, {
      credentials: 'same-origin',
      method: requestMethod,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    }).then((response) => {
      return responseTranformation(response);
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });

    return promise;
  }

  /**
   * @param {Object} params = { apiEndpoint, requestMethod, responseTranformation }
   */
  static withoutBodyData(params) {
    const { apiEndpoint, requestMethod, responseTranformation } = params;

    let promise = fetch(apiEndpoint, {
      credentials: 'same-origin',
      method: requestMethod
    }).then((response) => {
      return responseTranformation(response);
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });

    return promise;
  }
}
