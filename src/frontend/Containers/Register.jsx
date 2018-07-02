import React, { Component } from 'react';
import AddMemberForm from 'Components/AddMemberForm';
import Members from 'Components/Members';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import { LoadUsers, AddUser, DeleteUser, StartRegistrationSession } from '../Actions';

class Register extends Component {
    render() {
        return (
            <div>
                { this.props.authenticated && this.props.groupName && (
                    <div>
                        Hey! It looks like you're still logged in, do you want to start kiosk mode? &nbsp;
                        <Button variant="raised" onClick={() => this.props.startRegistrationSession()} color="primary">Start Registering</Button>
                    </div>
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
    authenticated: state.authenticated
 });
 const mapDispatchToProps = dispatch => {
     return {
        loadUsers: group => dispatch(LoadUsers(group)),
        addUser: (group, user) => dispatch(AddUser(group, user)),
        removeUser: (group, user) => dispatch(DeleteUser(group, user)),
        startRegistrationSession: () => dispatch(StartRegistrationSession())
     }
 }
 
 export default connect(mapStateToProps, mapDispatchToProps)(Register);