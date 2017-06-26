import React, { Component } from 'react';
import Form from './Form.jsx';
import Members from './Members.jsx';

export default class Main extends Component {
    constructor(props) {
        super(props);
        this.state = { registered: { groupName: "", users: [] }}
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
            // let newUsers = this.state.registered.users.concat([user]);
            // var newState = Object.assign({}, this.state.registered, {registered: { users: this.state.registered.users.concat([user]) }});
            // this.setState(Object.assign({}, this.state, newState));
            this.setState({ registered: { ...this.state.registered, users: this.state.registered.users.concat([user]) }})
        }
    }
    render () {
        return (
            <div className="main">
                <h1>Event Registration</h1>
                <h5>Group: {this.state.registered.groupName}</h5>
                <Form addUser={this.addUser.bind(this)} />
                <Members members={this.state.registered.users} reloadUsers={this.loadUsers.bind(this)} />
            </div>
        )
    }
}