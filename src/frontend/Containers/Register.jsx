import React, { Component } from 'react';
import Form from 'Components/Form';
import Members from 'Components/Members';
import { connect } from 'react-redux';
import { InitApp, LoadUsers, AddUser, LoadGroupName, DeleteUser, FetchToken } from '../Actions';

class Register extends Component {
    async componentDidMount() {
        await this.props.initApp();
    }
    render() {
        return (
            <div>
                  <h5 className="righted">Group: {this.props.groupNameBase && this.props.groupName && this.props.groupName.replace(this.props.groupNameBase, "")}</h5>
                  <h1>Event Registration</h1>                  
                  <Form addUser={this.props.addUser} group={this.props.groupName} />
                  <Members members={this.props.users} reloadUsers={this.props.loadUsers} removeUser={this.props.removeUser} group={this.props.groupName} />
                  <button onClick={() => this.props.fetchToken()}>Fetch Token</button>
          </div>
        )
    }
}

const mapStateToProps = state => ({
    groupName: state.groupName,
    users: state.users,
    groupNameBase: state.config.groupNameBase
 });
 const mapDispatchToProps = dispatch => {
     return {
        loadUsers: async group => await dispatch(LoadUsers(group)),
        addUser: async (group, user) => await dispatch(AddUser(group, user)),
        loadGroupName: async () => await dispatch(LoadGroupName()),
        removeUser: async (group, user) => await dispatch(DeleteUser(group, user)),
        initApp: async () => await dispatch(InitApp()),
        fetchToken: async () => await dispatch(FetchToken())
     }
 }
 
 export default connect(mapStateToProps, mapDispatchToProps)(Register);