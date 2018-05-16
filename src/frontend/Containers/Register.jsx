import React, { Component } from 'react';
import Form from 'Components/Form';
import Members from 'Components/Members';
import { connect } from 'react-redux';
import { InitApp, LoadUsers, AddUser, LoadGroupName, DeleteUser } from '../Actions';

class Register extends Component {
    async componentDidMount() {
        await this.props.initApp();
    }
    addUser = user => this.props.addUser(user);
    render () {
        return (
            <div>
                  <h5 className="righted">Group: {this.props.groupName.replace(this.props.groupNameBase, "")}</h5>
                  <h1>Event Registration</h1>                  
                  <Form addUser={this.addUser} />
                  <Members members={this.props.users} reloadUsers={this.props.loadUsers} removeUser={this.props.removeUser} />
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
            loadUsers: async () => await dispatch(LoadUsers()),
        addUser: user => dispatch(AddUser(user)),
        loadGroupName: () => dispatch(LoadGroupName()),
        removeUser: user => dispatch(DeleteUser(user)),
        initApp: () => dispatch(InitApp())
     }
 }
 
 export default connect(mapStateToProps, mapDispatchToProps)(Register);