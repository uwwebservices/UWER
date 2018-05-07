import React, { Component } from 'react';
import Form from 'Components/Form';
import Members from 'Components/Members';
import { Link } from 'react-router-dom';

export default class Main extends Component {
    constructor(props) {
        super(props);
        this.state = { registered: { groupName: "", configEnabled: false, users: [] }}
    }
    componentDidMount() {
        this.loadUsers();
    }
    loadUsers() {
        return fetch('/api/register?verbose=true')
            .then(res => res.json())
            .then(json => this.setState({registered: json}))
            .catch(err => console.log)
        
    }
    addUser(user) {
        if(!this.state.registered.users.some((u) => { return user.netid === u.netid })) {
            this.setState({ registered: { ...this.state.registered, users: this.state.registered.users.concat([user]) }})
        }
    }
    render () {
        return (
            <div>
                  <h5 className="righted">Group: {this.state.registered.leafName}</h5>
                  <h1>Event Registration</h1>                  
                  <Form addUser={this.addUser.bind(this)} />
                  <Members members={this.state.registered.users} reloadUsers={this.loadUsers.bind(this)} />
          </div>
        )
    }
}