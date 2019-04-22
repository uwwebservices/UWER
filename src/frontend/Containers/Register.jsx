import React, { Component } from 'react';
import AddMemberForm from 'Components/AddMemberForm';
import Members from 'Components/Members';
import PrivateMembers from 'Components/PrivateMembers';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import EndRegistrationModal from 'Components/EndRegistrationModal';
import { connect } from 'react-redux';
import { LoadUsers, AddUser, DeleteUser, StartRegistrationSession, StopRegistrationSession } from '../Actions';
import Cookies from 'browser-cookies';
import FA from 'react-fontawesome';

class Register extends Component {
  constructor(props) {
    super(props);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    setTimeout(() => {
      if (!this.props.authenticated && !this.props.token && !this.props.development) {
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
    if (this.props.groupName) {
      await this.props.loadUsers(this.props.groupName);
    }
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
          <EndRegistrationModal confirmCallback={this.endRegistration} showCancelButton={false} />
        </div>
        <div>
          <h1 className="inline">Event Registration</h1>
        </div>
        <AddMemberForm addUser={this.props.addUser} group={this.props.groupName} formDisabled={registrationDisabled} />

        <div className="memberList">
          <h2>Registered Participants {!this.props.confidential && <FA name="refresh" onClick={this.reload} spin={this.props.loadingUsers} />}</h2>
          {this.props.confidential && (
            <div>
              <p>Some text related to the fact that confidential groups do not persistently display users.</p>
            </div>
          )}
          {this.props.users.length == 0 && !this.props.confidential && <div>{this.props.loadingUsers ? <p>Loading participants; please wait.</p> : <p>No registered participants.</p>}</div>}
          {this.props.users.length > 0 && (
            <div>
              <List>
                {!this.props.confidential ? (
                  <Members
                    members={this.props.users}
                    development={this.props.development}
                    groupNameBase={this.props.groupNameBase}
                    removeUser={this.props.removeUser}
                    keepUser={this.registerCardFocus}
                    group={this.props.groupName}
                    authenticated={this.props.authenticated}
                  />
                ) : (
                  <PrivateMembers members={this.props.users} />
                )}
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
  loadingUsers: state.loadingUsers,
  groupNameBase: state.groupNameBase,
  authenticated: state.authenticated,
  token: state.registrationToken,
  development: state.development,
  netidAllowed: state.netidAllowed
});
const mapDispatchToProps = dispatch => {
  return {
    loadUsers: group => dispatch(LoadUsers(group)),
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
