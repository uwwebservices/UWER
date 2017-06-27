import React, { Component } from 'react';
import Form from './Form.jsx';
import Members from './Members.jsx';
import ConfigItem from './ConfigItem.jsx';
import SubmitButton from './SubmitButton.jsx';
import { Link } from 'react-router-dom'

export default class Configure extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentWillMount() {
        fetch('/api/config')
            .then(res => res.json())
            .then(json => this.setState(json))
            .then(() => {
                console.log('success!')
            });
    }
    onSubmit(e) {
        e.preventDefault();
        fetch('/api/config', {
            method: "PUT",
            body: JSON.stringify(this.state),
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
    onChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }
    render() {
        return (
            <div>
                <div className="rightLink"><Link to="/">home</Link></div>
                <h1>Configure</h1>
                <form className="configForm" onSubmit={this.onSubmit.bind(this)}>
                    {
                        Object.keys(this.state).map((k) => {
                            return <ConfigItem itemName={k} key={k} itemValue={this.state[k]} onChange={this.onChange.bind(this)} />
                        })
                    }
                    <SubmitButton display="Update Config" />
                </form>
            </div>
        )
    }
}