import React, { Component } from 'react';
import Form from 'Components/Form';
import Members from 'Components/Members';
import { Button } from 'material-ui';
import FA from 'react-fontawesome';
import Subgroup from 'Components/Subgroup';
import { connect } from 'react-redux';
import { InitApp, UpdateGroupName, LoadConfig, LoadSubgroups, DestroySubgroup, LoadUsers, LoadGroupName, CreateGroup, CheckAuthentication } from '../Actions';

class Configure extends Component {
    constructor(props) {
        super(props);
        this.state = { newSubgroup: "", message: "", loadingSubGroups: false };
    }
    async componentWillMount() {
        await this.props.initApp();
        if(!this.props.authenticated) {
            //await this.props.checkAuth();
            console.log(this.props.authenticated);
            if(!this.props.authenticated) {
                window.location = "/login?returnUrl=/config";
            }
            
        }
        this.setState({groupName: this.props.groupName});
    }
    validateGroupName(groupName) {
        let valid = groupName.indexOf(this.props.config.groupNameBase) >= 0;
        if(!valid) {
            this.setState({ "message": "Invalid Group Name, should begin with " + this.props.config.groupNameBase});
            setTimeout(() => {
                this.setState({"message": ""});
            }, 2500);
        } else {
            this.setState({"message": "Group is being created..."});
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

    createSubgroup = async () => {
        if(this.validateGroupName(this.state.newSubgroup)) {
            await this.props.createGroup(this.state.newSubgroup);
            // ugh, this sucks, hopefully we can find a better solution
            setTimeout(()=> {
                this.props.loadSubgroups(this.props.groupName);
                this.setState({"message": ""});
            }, 2000)
        }
    }

    updateGroupName = async groupName => {
        await this.props.updateGroupName(groupName);
        this.setState({groupName: this.props.groupName});
        await this.props.loadUsers(groupName);
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
                    <h2>Subgroups <FA name="refresh" onClick={this.loadSubGroups} spin={this.state.loadingSubGroups} /></h2>
                <div>
                    {
                        this.props.subgroups.map(subgroups => {
                            return <Subgroup key={subgroups.id} groupName={subgroups.id} deleteCallback={this.deleteSubGroup} selectedGroup={this.props.groupName} updateGroupName={this.updateGroupName} />
                        })
                    }
                </div>
                <label htmlFor={this.props.itemName} className="configLabel">{this.props.itemName}</label>
                <input type="text" className="newSubgroup" 
                    name="newSubgroup"
                    onChange={this.handleChange}
                />
                <Button variant="raised" color="primary" type="submit" onClick={this.createSubgroup}>Create New Subgroup</Button>
                <div>{this.state.message}</div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
   groupName: state.groupName,
   config: state.config,
   subgroups: state.subgroups,
   authenticated: state.authenticated
});
const mapDispatchToProps = dispatch => {
    return {
        updateGroupName: async groupName => await dispatch(UpdateGroupName(groupName)),
        loadSubgroups: async groupName => await dispatch(LoadSubgroups(groupName)),
        loadGroupName: async () => await dispatch(LoadGroupName()),
        destroySubgroup: async subgroup => await dispatch(DestroySubgroup(subgroup)),
        initApp: async () => await dispatch(InitApp()),
        loadUsers: async group => await dispatch(LoadUsers(group)),
        createGroup: async group => await dispatch(CreateGroup(group)),
        checkAuth: async () => await dispatch(CheckAuthentication())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Configure);