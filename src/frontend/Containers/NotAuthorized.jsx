import React, { Component } from 'react';
import { connect } from 'react-redux';
import RegistrationModal from 'Components/RegistrationModal';
import FA from 'react-fontawesome';
import Button from '@material-ui/core/Button';
import { StopRegistrationSession } from '../Actions';

class NotAuthorized extends Component {
  endRegistration = () => {
    this.props.stopRegistrationSession();
    this.props.history.push('/');
  };
  render() {
    return (
      <div>
        <h1>Not Authorized</h1>
        <div>You are not authorized to use this UWER instance, you must be an administrator to login.</div>
        <br />
        <RegistrationModal openButtonText="Home" dialogTitle="Return Home" endRegistration={this.endRegistration} openButtonColor="primary" cancelButtonText="Cancel" approveButtonText="Back to Home">
          <p>Are you sure you want to log out and return home?</p>
        </RegistrationModal>
        &nbsp;
      </div>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => {
  return {
    stopRegistrationSession: () => dispatch(StopRegistrationSession())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotAuthorized);
