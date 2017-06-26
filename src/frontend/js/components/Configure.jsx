import React, { Component } from 'react';
import Form from './Form.jsx';
import Members from './Members.jsx';
import { Link } from 'react-router-dom'

export default class Configure extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <div>
                <div className="rightLink"><Link to="/">home</Link></div>
                <h1>Configure</h1>
            </div>
        )
    }
}