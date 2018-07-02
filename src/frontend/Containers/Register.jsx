import React, { Component } from 'react';
import AddMemberForm from 'Components/AddMemberForm';
import Members from 'Components/Members';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import { LoadUsers, AddUser, DeleteUser, StartRegistrationSession, StopRegistrationSession } from '../Actions';

class Register extends Component {
    endRegistration = () => {
        this.props.stopRegistrationSession();
        this.props.history.push("/");
    }
    componentWillMount() {
        console.log("WillMount auth", this.props.authenticated, "token", this.props.token)
        if(!this.props.authenticated && !this.props.token) {
            this.props.history.push("/");
        }
    }
    componentWillUpdate() {
        console.log("WillUpdate auth", this.props.authenticated, "token", this.props.token)
        if(!this.props.authenticated && !this.props.token) {
            this.props.history.push("/");
        }
    }
    render() {
        let adminMode = this.props.authenticated && this.props.groupName;
        return (
            <div>
                { adminMode && (
                    <div>
                        Hey! It looks like you're still logged in, do you want to start kiosk mode? &nbsp;
                        <Button variant="raised" onClick={() => this.props.startRegistrationSession()} color="primary">Start Registering</Button>
                    </div>
                )}
                { !adminMode && (
                    <span className="righted">
                        <a href="" onClick={() => this.endRegistration()}>End Registration</a>
                    </span>
                )}
                  <h1>Event Registration</h1>                  
                  <AddMemberForm addUser={this.props.addUser} group={this.props.groupName} />
                  <Members members={this.props.users} reloadUsers={this.props.loadUsers} removeUser={this.props.removeUser} group={this.props.groupName} authenticated={this.props.authenticated} />
          </div>
        )
    }
}

const mapStateToProps = state => ({
    groupName: state.groupName,
    users: state.users,
    groupNameBase: state.config.groupNameBase,
    authenticated: state.authenticated,
    token: state.registrationToken
 });
 const mapDispatchToProps = dispatch => {
     return {
        loadUsers: group => dispatch(LoadUsers(group)),
        addUser: (group, user) => dispatch(AddUser(group, user)),
        removeUser: (group, user) => dispatch(DeleteUser(group, user)),
        startRegistrationSession: () => dispatch(StartRegistrationSession()),
        stopRegistrationSession: () => dispatch(StopRegistrationSession())
     }
 }
 
 export default connect(mapStateToProps, mapDispatchToProps)(Register);