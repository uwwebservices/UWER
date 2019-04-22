import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import background from 'Images/oragami.jpg';

class Welcome extends Component {
  componentDidMount() {
    setTimeout(() => {
      if (this.props.authenticated && !this.props.token) {
        this.props.history.push('/config');
        return;
      } else if (!this.props.authenticated && this.props.token) {
        this.props.history.push('/register');
        return;
      }
    }, 0);
  }
  configure = () => {
    window.location = '/login?returnUrl=/config';
  };
  render() {
    return (
      <div>
        <div className="welcomeHeader">
          <img src={background} className="background" />
          <h1>Welcome to Event Registration</h1>
        </div>
        <div className="welcomeTable">
          <div>
            <p>To get started: Log in with your UW NetID and setup your event.</p>
            <p>Access is restricted to previously setup personnel. If you need help with your Event Registration setup, please email help@uw.edu and ask for Enterprise Web Services.</p>
          </div>
          <div className="welcomeRight">
            <Button variant="raised" color="primary" type="submit" onClick={this.configure}>
              Start Event Setup
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  token: state.registrationToken,
  authenticated: state.authenticated
});
const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Welcome);
