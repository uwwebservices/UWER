import React from 'react';
import Button from '@material-ui/core/Button';
import './style.scss';

class Authorization extends React.Component {
  constructor() {
    super();
    this.state = { showRetry: false, retries: 0 };
  }
  async componentDidMount() {
    await this.checkAuth();
  }
  async checkAuth() {
    await this.props.checkAuthentication();
  }
  render() {
    const { loginRequired, authenticated, registrationToken, iaaAuth, iaaCheck, iaaRequired, children, path, resetState } = this.props;

    // if we've been stuck on this page for 5s, give option to retry
    setTimeout(() => this.setState({ showRetry: true }), 5000);

    if (authenticated !== null && iaaAuth !== null) {
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
        {this.state.showRetry && (
          <Button variant="raised" onClick={() => this.checkAuth()} color="primary" className="righted">
            Retry
          </Button>
        )}
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
