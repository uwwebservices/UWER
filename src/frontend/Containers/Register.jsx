import React, { Component } from 'react';
import AddMemberForm from 'Components/AddMemberForm';
import Members from 'Components/Members';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import RegistrationModal from 'Components/RegistrationModal';
import { connect } from 'react-redux';
import { LoadUsers, AddUser, DeleteUser, StartRegistrationSession, StopRegistrationSession } from '../Actions';
import FA from 'react-fontawesome';
import { Link } from 'react-router-dom';
import LoadingUsers from 'Components/LoadingUsers';

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedUsers: false
    };
  }
  async componentDidMount() {
    if (!this.state.loadedUsers) {
      await this.props.loadUsers();
      this.setState({ loadedUsers: true });
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    setTimeout(() => {
      if (!this.props.authenticated && !this.props.token) {
        if (!Cookies.get('registrationToken')) {
          this.props.history.push('/');
        }
      }
    }, 0);

    if (prevProps.users.length === 0 || prevProps.users.length !== this.props.users.length) {
      this.registerCardFocus();
    }
  }

  reload = async () => {
    await this.props.loadUsers();
  };
  endRegistration = () => {
    this.props.stopRegistrationSession();
    this.props.history.push('/');
  };
  configRedirect = () => {
    this.props.history.push('/config');
  };
  registerCardFocus = () => {
    document.getElementById('registerCard').focus({ preventScroll: true });
  };
  render() {
    let adminMode = this.props.authenticated && this.props.groupName;
    let registrationDisabled = !this.props.groupName;
    return (
      <div>
        {(registrationDisabled || adminMode) && (
          <div className="registrationNotification">
            {registrationDisabled && <span>You must first select a group to begin registration &nbsp;</span>}
            {adminMode && <span>Hey! It looks like you're still logged in, do you want to start kiosk mode? &nbsp;</span>}
            <Button variant="raised" onClick={() => this.configRedirect()} color="primary" className="righty">
              Finish Configuring
            </Button>
          </div>
        )}
        <div className="righted inline">
          {!this.props.authenticated && (
            <RegistrationModal
              endRegistration={this.endRegistration}
              dialogTitle="End Registration"
              openButtonText="End Registration"
              cancelButtonText="Back"
              approveButtonText="End Registration"
              approveButtonColor="secondary"
              openButtonColor="secondary"
            >
              <p>
                Are you sure that you want to end registration? <br />
                This will completely log you out, to continue registering <br />
                you will need an administrator to start a new session.
              </p>
            </RegistrationModal>
          )}
        </div>
        <div>
          <h1 className="inline">Event Registration</h1>
        </div>
        <AddMemberForm addUser={this.props.addUser} authenticated={this.props.authenticated} group={this.props.groupName} netidAllowed={this.props.netidAllowed} formDisabled={registrationDisabled} />

        <div className="memberList">
          <h2>Registered Participants {!this.props.confidential && <FA name="refresh" onClick={this.reload} spin={this.props.loadingUsers} />}</h2>
          {this.props.confidential && (
            <div>
              <p>Membership for this event is private, members will only be displayed for {this.props.privGrpVisTimeout} seconds.</p>
            </div>
          )}
          {!this.props.groupName && this.props.authenticated && (
            <p>
              No registration group selected, <Link to="config">choose one here.</Link>
            </p>
          )}

          {this.props.groupName && this.props.users.length == 0 && !this.props.confidential && <div>{this.props.loadingUsers ? <LoadingUsers /> : <p>No registered participants.</p>}</div>}
          {this.props.users.length > 0 && (
            <div>
              <List>
                <Members members={this.props.users} removeUser={this.props.removeUser} keepUser={this.registerCardFocus} group={this.props.groupName} authenticated={this.props.authenticated} confidential={this.props.confidential} />
              </List>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  confidential: state.confidential,
  groupName: state.groupName,
  users: state.users,
  loadingUsers: state.loading.users,
  authenticated: state.authenticated,
  token: state.registrationToken,
  netidAllowed: state.netidAllowed,
  privGrpVisTimeout: state.privGrpVisTimeout
});
const mapDispatchToProps = dispatch => {
  return {
    loadUsers: () => dispatch(LoadUsers()),
    addUser: (group, user) => dispatch(AddUser(group, user)),
    removeUser: (group, user) => dispatch(DeleteUser(group, user)),
    startRegistrationSession: (groupName, netidAllowed) => dispatch(StartRegistrationSession(groupName, netidAllowed)),
    stopRegistrationSession: () => dispatch(StopRegistrationSession())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Register);
