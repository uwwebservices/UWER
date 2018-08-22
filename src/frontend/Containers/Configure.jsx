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
        this.state = { newSubgroup: "", loadingSubGroups: false, loadingConfigPage: true };
    }
    async componentWillMount() {
        //await this.props.checkAuth();
        if(!this.props.authenticated && !this.props.development) {
            await this.props.checkAuth();
            if(!this.props.authenticated) {
                window.location = "/login?returnUrl=/config";
            }

            if(!this.props.iaaAuth)
            {
                console.log(this.props.iaaCheck)
                window.location = this.props.iaaCheck;
            }
        }
        this.setState({groupName: this.props.groupName});
    }
    validateGroupString(groupName) {
        var RegExpression = /^[a-zA-Z0-9\s]*$/; 
        if(RegExpression.test(groupName)) {
            return true;
        }
        return false;
    }
    generateGroupName(groupString) {
        groupString = groupString.replace(/\s+/g, '-').toLowerCase();
        return this.props.groupNameBase + groupString;
    }
    loadSubGroups = async () => {
        this.setState({loadingSubGroups: true});
        await this.props.loadSubgroups(this.props.groupName);
        this.setState({loadingSubGroups: false});
    };

    handleChange = e => {
        this.setState({[e.target.name]: e.target.value});
    }

    createSubgroup = async e => {
        e.preventDefault();
        if(this.validateGroupString(this.state.newSubgroup)) {
            this.setState({"creatingGroup": true });
            await this.props.createGroup(this.generateGroupName(this.state.newSubgroup));
            this.props.loadSubgroups(this.props.groupName);
            this.setState({"creatingGroup": false, "newSubgroup": "" });
            this.props._addNotification("Registration Group Created", `Successfully created registration group: ${this.state.newSubgroup}`)
        } else {
            this.props._addNotification("Create Registration Group Failed", "Group name can only contain numbers, letters and spaces.");
        }
    }

    updateGroupName = async groupName => {
        await this.props.updateGroupName(groupName);
        this.props.loadUsers(groupName);
        this.props._addNotification("Change Selected Group", `Selected group successfully changed to: ${this.displayGroupName(groupName)}`, "success");
    }
    displayGroupName = groupName => {
        return groupName.replace(this.props.groupNameBase, "").replace(/-/g, ' ');
    }
    startRegistration = async () => {
        await this.props.startRegistrationSession();
        this.props.history.push("/register");
    }

    endRegistration = async () => {
        await this.props.stopRegistrationSession();
        this.props.history.push("/");
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
                    <div className="subgroupTable">
                        {
                            this.props.subgroups.map(subgroup => {
                                return <Subgroup key={subgroup.id} subgroup={subgroup} 
                                      deleteCallback={this.props.destroySubgroup} selectedGroup={this.props.groupName} 
                                      updateGroupName={this.updateGroupName} 
                                      groupNameBase={this.props.groupNameBase}
                                      displayGroupName={this.displayGroupName}
                                    />
                            })
                        }
                    </div>
                </div>
                <form className="form" onSubmit={this.createSubgroup}>
                    <label htmlFor={this.props.itemName} className="configLabel">{this.props.itemName}</label>
                    <input type="text" className="newSubgroup" 
                        name="newSubgroup"
                        onChange={this.handleChange}
                        value={this.state.newSubgroup}
                        disabled={this.state.creatingGroup}
                    />
                    
                    <Button disabled={this.state.creatingGroup} variant="raised" color="primary" type="submit">
                        {this.state.creatingGroup ? <span><FA name="spinner" spin={true} /> Creating</span> : "Create New Subgroup"}
                    </Button>
                </form>
            </div>
        )
    }
}

const mapStateToProps = state => ({
   groupName: state.groupName,
   config: state.config,
   subgroups: state.subgroups,
   authenticated: state.authenticated,
   development: state.development,
   iaaAuth: state.iaaauth,
   iaaCheck: state.iaacheck,
   groupNameBase: state.config.groupNameBase
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