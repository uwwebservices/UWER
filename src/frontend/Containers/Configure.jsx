import React, { Component } from 'react';
import Form from 'Components/Form';
import Members from 'Components/Members';
import ConfigItem from 'Components/ConfigItem';
import { Link } from 'react-router-dom'
import {Button} from 'material-ui';
import FA from 'react-fontawesome';

export default class Configure extends Component {
    constructor(props) {
        super(props);
        this.state = { message: "", config: {}, subgroups: [], loadingSubGroups: false};
    }
    componentDidMount() {
        this.loadConfig().then(() => {
            this.loadSubGroups();
        });
    }
    loadConfig = () => {
        return fetch('/api/config')
            .then(res => res.json())
            .then((json) => {
                let newConfig = this.state.config;
                newConfig.config = json;
                this.setState(newConfig);
            })
            .catch((err) => {
                return this.setState(Object.assign({}, this.state, {"message": "Config Not Available."}));
            });
    };
    loadSubGroups = () => {
        this.setState({loadingSubGroups: true});
        return fetch(`/api/groups/${this.state.config.groupNameBase}/subgroups`)
            .then(res => res.json())
            .then(subgroups => {
                this.setState(Object.assign({}, this.state, {"subgroups": subgroups}));
                this.setState({loadingSubGroups: false});
                return subgroups;
            });
    };

    deleteSubGroup = subGroup => {
        return fetch(`/api/groups/${subGroup}`, {
            method: "DELETE"
        }).then(() => {
            let subs = this.state.subgroups;
            if(subs.indexOf(subGroup) > -1) {
                subs.splice(subs.indexOf(subGroup), 1);
                this.setState({subgroups: subs});
            }
        })
    };

    handleSubmit = (e) => {
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
    };

    handleChange = e => {
        let newConfig = this.state.config;
        newConfig[e.target.name] = e.target.value;
        this.setState(newConfig);
    };

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
                    <h2>Subgroups <FA name="refresh" onClick={this.loadSubGroups} spin={this.state.loadingSubGroups}>autorenew</FA></h2>
                <ul>
                    {
                        this.state.subgroups.map(groupName => {
                            return <li key={groupName}>{groupName} | <a href="#" onClick={() => this.deleteSubGroup(groupName)}>x</a></li>
                        })
                    }
                </ul>
            </div>
        )
    }
}