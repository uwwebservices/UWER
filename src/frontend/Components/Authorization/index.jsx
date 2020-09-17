import React from 'react';
import './style.scss';

class Authorization extends React.Component {
  constructor() {
    super();
    this.state = { showRetry: false, retries: 0 };
  }

  async componentDidMount() {
    await this.props.checkAuthentication();
    await this.props.checkToken();
  }

  render() {
    const { loginRequired, tokenRequired, authenticated, registrationToken, iaaAuth, iaaCheck, iaaRequired, children, path, resetState } = this.props;

    if (authenticated !== null && iaaAuth !== null) {
      // If we navigate to /config, are not authenticated, have no token, go back to /
      if (tokenRequired && !authenticated && !registrationToken) {
        window.location = `/`;
      }

      // If we navigate to /config, are not authenticated, but have a token, go back to /register
      if (loginRequired && !authenticated && registrationToken) {
        window.location = `/register`;
      }

      if (loginRequired && !authenticated && !registrationToken) {
        // because the state is persisted to localStorage and we tried authenticating already
        // state.authenticated will be reloaded as false intead of null, causing a redirect loop
        resetState();
        window.location = `/login?returnUrl=${path}`;
      }

      if (authenticated && iaaRequired && !iaaAuth) {
        // because the state is persisted to localStorage and we tried authenticating already
        // state.authenticated will be reloaded as false intead of null, causing a redirect loop
        resetState();
        window.location = iaaCheck;
      }
    }

    let shouldRenderChildren = loginRequired ? authenticated : true;
    shouldRenderChildren = iaaRequired ? iaaAuth : true; // must be auth'd to be iaa'd, this override should be fine
    shouldRenderChildren = authenticated === null || iaaAuth === null ? false : shouldRenderChildren; // initial load, auth is null, wait for checkAuth to return

    return shouldRenderChildren ? (
      children
    ) : (
      <div>
        <h2>Verifying Authorization</h2>
        <p>This should only take a second...</p>

        <div id="loader">
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>
    );
  }
}

export default Authorization;