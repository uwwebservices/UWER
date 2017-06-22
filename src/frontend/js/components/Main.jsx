import React from 'react';
import Form from './Form.jsx';
import Members from './Members.jsx';

export default class Main extends React.Component {
    render () {
        return (
            <div className="main">
                <h1>Event Registration</h1>
                <Form />
                <Members />
            </div>
        )
    }
}