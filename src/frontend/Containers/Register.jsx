import React, { Component } from 'react';
import Form from 'Components/Form';
import Members from 'Components/Members';
import { connect } from 'react-redux';
import { LoadUsers, AddUser, LoadGroupName, DeleteUser } from '../Actions';

class Register extends Component {
    render() {
        return (
            <div>
                  <h1>Event Registration</h1>                  
                  <Form addUser={this.props.addUser} group={this.props.groupName} />
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
        loadUsers: async group => await dispatch(LoadUsers(group)),
        addUser: async (group, user) => await dispatch(AddUser(group, user)),
        loadGroupName: async () => await dispatch(LoadGroupName()),
        removeUser: async (group, user) => await dispatch(DeleteUser(group, user))
     }
 }
 
 export default connect(mapStateToProps, mapDispatchToProps)(Register);