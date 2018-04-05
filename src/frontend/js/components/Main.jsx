import React, { Component } from 'react';
import Form from './Form.jsx';
import Members from './Members.jsx';
import Configure from './Configure.jsx';
import { Link } from 'react-router-dom';


import header from '../../img/header_left.png';

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
                <div className="main grid-container">
                    <div className="grid-item header">
                        <img src={header} />                        
                    </div>
                    <div className="grid-item main">
                        <h1>Event Registration</h1>
                        {this.state.registered.configEnabled && <div><Link to="/config">config</Link></div>}
                        <h5>Group: {this.state.registered.leafName}</h5>
                        <Form addUser={this.addUser.bind(this)} />
                        <Members members={this.state.registered.users} reloadUsers={this.loadUsers.bind(this)} />
                    </div>
                    <div className="grid-item footer">
                        foot
                    </div>
                </div>
            </div>
        )
    }
}