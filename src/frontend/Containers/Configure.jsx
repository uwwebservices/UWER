import React, { Component } from 'react';
import Form from '../Components/Form';
import Members from '../Components/Members';
import ConfigItem from '../Components/ConfigItem';
import { Link } from 'react-router-dom'

export default class Configure extends Component {
    constructor(props) {
        super(props);
        this.state = { message: "", config: {}};
    }
    componentWillMount() {
        fetch('/api/config')
            .then(res => res.json())
            .then((json) => {
                let newConfig = this.state.config;
                newConfig.config = json;
                this.setState(newConfig);
            })
            .catch((err) => {
                console.log(err);
                return this.setState(Object.assign({}, this.state, {"message": "Config Not Available."}));
            })
    }
    onSubmit(e) {
        this.setState(Object.assign({}, this.state, {"message": ""}));
        e.preventDefault();
        fetch('/api/config', {
            method: "PUT",
            body: JSON.stringify(this.state.config),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(() => {
            this.setState(Object.assign({}, this.state, {"message": "Success! Redirecting..."}));
            setTimeout(() => {
                this.props.history.push('/');
            }, 2000);
            
        })
        .catch((err) => {
            return this.setState(Object.assign({}, this.state, {"message": "Update Failed!"}));
        });
    }
    onChange(e) {
        let newConfig = this.state.config;
        newConfig[e.target.name] = e.target.value;
        this.setState(newConfig);
    }
    render() {
        return (
            <div>
                <h1>Configure</h1>
                <form className="configForm" onSubmit={this.onSubmit.bind(this)}>
                    {
                        Object.keys(this.state.config).map((k) => {
                            return <ConfigItem itemName={k} key={k} itemValue={this.state.config[k]} onChange={this.onChange.bind(this)} />
                        })
                    }
                    <button type="submit" className="submitButton">Update Config</button>
                    <div>{this.state.message}</div>
                </form>
            </div>
        )
    }
}