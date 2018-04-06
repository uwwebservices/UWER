import React, { Component } from 'react';
import Form from '../Components/Form';
import Members from '../Components/Members';
import { Link } from 'react-router-dom';


export default class Main extends Component {
    constructor(props) {
        super(props);
        this.state = { registered: { groupName: "", configEnabled: false, users: [] }}
    }
    componentWillMount() {
        this.loadUsers();
    }
    loadUsers() {
        fetch('/api/register?verbose=true')
            .then(res => res.json())
            .then(json => this.setState({registered: json}));
    }
    addUser(user) {
        if(!this.state.registered.users.some((u) => { return user.netid === u.netid })) {
            this.setState({ registered: { ...this.state.registered, users: this.state.registered.users.concat([user]) }})
        }
    }
    render () {
        return (
          <div>
                  <h1>Event Registration</h1>
                  <h5>Group: {this.state.registered.leafName}</h5>
                  <Form addUser={this.addUser.bind(this)} />
                  <Members members={this.state.registered.users} reloadUsers={this.loadUsers.bind(this)} />
          </div>
        )
    }
}