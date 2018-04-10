import React, { Component } from 'react';
import Form from '../Components/Form';
import Members from '../Components/Members';
import ConfigItem from '../Components/ConfigItem';
import { Link } from 'react-router-dom'

export default class Configure extends Component {
    constructor(props) {
        super(props);
        this.state = { message: "", config: {}};
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    componentDidMount() {
        fetch('/api/config')
            .then(res => res.json())
            .then((json) => {
                let newConfig = this.state.config;
                newConfig.config = json;
                this.setState(newConfig);
            })
            .catch((err) => {
                return this.setState(Object.assign({}, this.state, {"message": "Config Not Available."}));
            })
    }
    handleSubmit(e) {
        e.preventDefault();
        this.setState(Object.assign({}, this.state, {"message": ""}));
        
        fetch('/api/config', {
            method: "PUT",
            body: JSON.stringify(this.state.config),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(() => {
            this.setState(Object.assign({}, this.state, {"message": "Success! Redirecting..."}));
            this.props.history.push('/');
        })
        .catch((err) => {
            this.setState(Object.assign({}, this.state, {"message": "Update Failed!"}));
        });
    }
    handleChange(e) {
        let newConfig = this.state.config;
        newConfig[e.target.name] = e.target.value;
        this.setState(newConfig);
    }
    render() {
        return (
            <div>
                <h1>Configure</h1>
                <form className="configForm" onSubmit={this.handleSubmit}>
                    {
                        Object.keys(this.state.config).map((k) => {
                            return <ConfigItem itemName={k} key={k} itemValue={this.state.config[k]} onChange={this.handleChange} />
                        })
                    }
                    <button type="submit" className="submitButton">Update Config</button>
                    <div>{this.state.message}</div>
                </form>
            </div>
        )
    }
}