import React from 'react';

import { SafetyFirst } from '../safety-first';

export class PromiseComponent extends SafetyFirst {
  constructor(props) {
    super(props);
    this.state = {
      inProgress: false,
      errorMessage: '',
    };
  }

  handlePromise(promise) {
    this.setState({
      inProgress: true
    });
    return promise.then(
      res => this._then(res),
      error => this._catch(error)
    );
  }

  _then(res) {
    this.setState({
      inProgress: false,
      errorMessage: '',
    });
    return res;
  }

  _catch(error) {
    const errorMessage = error.message || 'An error occurred. Please try again.';
    this.setState({
      inProgress: false,
      errorMessage,
    });
    return Promise.reject(errorMessage);
  }
}