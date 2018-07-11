import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import FA from 'react-fontawesome';
import Subgroup from 'Components/Subgroup';
import { connect } from 'react-redux';
import RegistrationModal from 'Components/RegistrationModal';
import EndRegistrationModal from 'Components/EndRegistrationModal';
import { UpdateGroupName, LoadSubgroups, DestroySubgroup, LoadUsers, CreateGroup, CheckAuthentication, StartRegistrationSession, StopRegistrationSession } from '../Actions';

class Configure extends Component {
    constructor(props) {
        super(props);
        this.state = { newSubgroup: "", message: "", loadingSubGroups: false, loadingConfigPage: true };
    }
    async componentWillMount() {
        if(!this.props.authenticated && !this.props.development) {
            await this.props.checkAuth();
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
    defaultSubgroup = (e) => {
        if(!e.target.value) {
            this.setState({newSubgroup: this.props.config.groupNameBase});
        }
    }

    createSubgroup = async () => {
        if(this.validateGroupName(this.state.newSubgroup)) {
            await this.props.createGroup(this.state.newSubgroup);
            this.props.loadSubgroups(this.props.groupName);
            this.setState({"message": ""});
            this.setState({newSubgroup: this.props.config.groupNameBase});
        }
    }

    updateGroupName = async groupName => {
        await this.props.updateGroupName(groupName);
        this.setState({groupName: this.props.groupName});
        this.props.loadUsers(groupName);
        this.props._addNotification("Change Selected Group", `Selected group successfully changed to: ${groupName}`, "success");
    }

    startRegistration = async () => {
        await this.props.startRegistrationSession();
        this.props.history.push("/register");
    }

    endRegistration = async () => {
        await this.props.stopRegistrationSession();
        this.props.history.push("/");
    }
    addNotification = e => {
        e.preventDefault();
        this.props._addNotification("hello!");
    }

    render() {
        let canStartRegistration = this.props.groupName.length > 0;
        return (
            <div>
                <h1>Configure</h1>
                <RegistrationModal confirmCallback={this.startRegistration} openButtonDisabled={!canStartRegistration} /> &nbsp;
                <EndRegistrationModal confirmCallback={this.endRegistration} /> &nbsp;
               
                <div className="subgroupList">
                    <h2>Subgroups <FA name="refresh" onClick={this.loadSubGroups} spin={this.state.loadingSubGroups} /></h2>
                    <div>
                        {
                            this.props.subgroups.map(subgroups => {
                                return <Subgroup key={subgroups.id} groupName={subgroups.id} deleteCallback={this.deleteSubGroup} selectedGroup={this.props.groupName} updateGroupName={this.updateGroupName} />
                            })
                        }
                    </div>
                </div>
                <label htmlFor={this.props.itemName} className="configLabel">{this.props.itemName}</label>
                <input type="text" className="newSubgroup" 
                    name="newSubgroup"
                    onChange={this.handleChange}
                    value={this.state.newSubgroup}
                    onClick={this.defaultSubgroup}
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
   authenticated: state.authenticated,
   development: state.development
});
const mapDispatchToProps = dispatch => {
    return {
        updateGroupName: groupName => dispatch(UpdateGroupName(groupName)),
        loadSubgroups: groupName => dispatch(LoadSubgroups(groupName)),
        destroySubgroup: subgroup => dispatch(DestroySubgroup(subgroup)),
        loadUsers: group => dispatch(LoadUsers(group)),
        createGroup: group => dispatch(CreateGroup(group)),
        checkAuth: () => dispatch(CheckAuthentication()),
        startRegistrationSession: () => dispatch(StartRegistrationSession()),
        stopRegistrationSession: () => dispatch(StopRegistrationSession())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Configure);