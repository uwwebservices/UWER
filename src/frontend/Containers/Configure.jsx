import React, { Component } from 'react';
import Form from 'Components/Form';
import Members from 'Components/Members';
import ConfigItem from 'Components/ConfigItem';
import { Button } from 'material-ui';
import FA from 'react-fontawesome';
import Subgroup from 'Components/Subgroup';
import { connect } from 'react-redux';
import { InitApp, UpdateGroupName, LoadConfig, LoadSubgroups, DestroySubgroup } from '../Actions'

class Configure extends Component {
    constructor(props) {
        super(props);
        this.state = { groupName: "", message: "", loadingSubGroups: false };
    }
    async componentDidMount() {
        await this.props.initApp();
        this.setState({groupName: this.props.groupName});
    }
    validateGroupName(groupName) {
        let valid = groupName.indexOf(this.props.config.groupNameBase) >= 0;
        if(!valid) {
            this.setState({ "message": "Invalid Group Name, should begin with " + this.props.config.groupNameBase});
        } else {
            this.setState({"message": "Updated Group."});
        }
        
        return valid;
    }
    loadSubGroups = async () => {
        this.setState({loadingSubGroups: true});
        await this.props.loadSubgroups(this.props.groupName);
        this.setState({loadingSubGroups: false});
    };

    deleteSubGroup = async subgroup => {
        await this.props.destroySubgroup(subgroup);
    };

    handleChange = e => {
        this.setState({[e.target.name]: e.target.value});
    }

    handleSubmit = async e => {
        e.preventDefault();
        let groupName = e.target.groupName.value;
        if(this.validateGroupName(groupName)) {
            await this.props.updateGroupName(groupName);
        }
    }

    render() {
        return (
            <div>
                <h1>Configure</h1>
                {
                    Object.keys(this.props.config).map(k => {
                        return <div key={k}>{k}: {this.props.config[k]}</div>
                    })
                }
                <form className="configForm" onSubmit={this.handleSubmit}>
                    <ConfigItem itemName="groupName" key="groupName" itemValue={this.state.groupName} onChange={this.handleChange}/>
                    <Button variant="raised" color="primary" type="submit">Update Config</Button>
                    <div>{this.state.message}</div>
                </form>
                    <h2>Subgroups <FA name="refresh" onClick={this.loadSubGroups} spin={this.state.loadingSubGroups} /></h2>
                <div>
                    {
                        this.props.subgroups.map(groupName => {
                            return <Subgroup key={groupName} groupName={groupName} deleteCallback={this.deleteSubGroup} />
                        })
                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
   groupName: state.groupName,
   config: state.config,
   subgroups: state.subgroups
});
const mapDispatchToProps = dispatch => {
    return {
        updateGroupName: async groupName => await dispatch(UpdateGroupName(groupName)),
        loadSubgroups: async groupName => await dispatch(LoadSubgroups(groupName)),
        destroySubgroup: async subgroup => await dispatch(DestroySubgroup(subgroup)),
        initApp: async () => await dispatch(InitApp())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Configure);