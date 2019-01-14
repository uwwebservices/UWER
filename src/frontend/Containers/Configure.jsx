import React, { Component } from 'react';
import FA from 'react-fontawesome';
import Subgroup from 'Components/Subgroup';
import { connect } from 'react-redux';
import RegistrationModal from 'Components/RegistrationModal';
import EndRegistrationModal from 'Components/EndRegistrationModal';
import ConfigOptions from 'Components/ConfigOptions';
import ContentModal from 'Components/ContentModal';
import { UpdateGroupName, LoadSubgroups, DestroySubgroup, LoadUsers, CreateGroup, StartRegistrationSession, StopRegistrationSession, ToggleNetIDAllowed } from '../Actions';

class Configure extends Component {
    constructor(props) {
        super(props);
        this.state = { newSubgroup: "", loadingSubGroups: false, 
                       loadingConfigPage: true, invalidSubgroup: true, 
                       confidential: true, netidAllowed: false, tokenTTL: 180,
                       newSubgroupDescription: "", newSubgroupEmailEnabled: false 
                    };
    }
    async componentDidMount() {
        this.setState({groupName: this.props.groupName});
    }
    validateGroupString(groupName) {
        var RegExpression = /^[a-zA-Z0-9\s]*$/; 
        if(RegExpression.test(groupName) && groupName.length > 2) {
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
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        this.setState({[e.target.name]: value});

        if(e.target.name === "newSubgroup") {
            this.setState({invalidSubgroup: !this.validateGroupString(value)})
        }
    }

    createSubgroup = async () => {
        if(this.validateGroupString(this.state.newSubgroup)) {
            this.setState({"creatingGroup": true });
            let success = await this.props.createGroup(this.generateGroupName(this.state.newSubgroup), this.state.confidential, this.state.newSubgroupDescription, this.state.newSubgroupEmailEnabled);
            if(success) {
                this.props.loadSubgroups(this.props.groupName);
                this.props._addNotification("Registration Group Created", `Successfully created registration group: ${this.state.newSubgroup}`)
            } else {
                this.props._addNotification("Create Registration Group Failed", "Group creation failed, does this group already exist?");
            }
            this.setState({"creatingGroup": false, "newSubgroup": "", "confidential": true, newSubgroupDescription: "", newSubgroupEmailEnabled: false });
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
        this.props.history.push("/register");
        await this.props.startRegistrationSession(this.props.groupName, this.state.netidAllowed, this.state.tokenTTL);
        
    }

    endRegistration = async () => {
        await this.props.stopRegistrationSession();
        this.props.history.push("/");
    }

    render() {
        let canStartRegistration = this.props.groupName.length > 0;
        return (
            <div>
                <div className="righted inline"><EndRegistrationModal confirmCallback={this.endRegistration} openButtonText="Logout" /></div>
                <h1 className="inline">Configure</h1>
                
                <ConfigOptions netidAllowed={this.state.netidAllowed} tokenTTL={this.state.tokenTTL} handleChange={this.handleChange} />
                <br />
                <div className="card">
                    <div className="card-header">
                         <h2 className="inline">Select a Registration Group <FA name="refresh" onClick={this.loadSubGroups} spin={this.state.loadingSubGroups} /></h2>
                        <ContentModal 
                            openWithButton={true}
                            openButtonText="Add a new Registration Group"
                            openButtonIcon="plus" 
                            dialogTitle="Create a New Registration Group" 
                            openButtonText="" 
                            openButtonVariant="fab" 
                            openButtonMini={true} 
                            openButtonClasses={["createSubgroup"]}
                            confirmCallback={this.createSubgroup}
                            approveButtonText={this.state.creatingGroup ? <span><FA name="spinner" spin={true} /> Creating</span> : "Create New Subgroup"}
                            approveButtonDisabled={this.state.invalidSubgroup || this.state.creatingGroup}
                            cancelButtonDisabled={this.state.creatingGroup}
                            disableBackdropClick={true}
                        >
                            <div className="createSubgroupModal">
                                <div>
                                    <label htmlFor="newSubgroup" className="configLabel">Event Name:</label><br />
                                    <input type="text" className="newSubgroup" id="newSubgroup"
                                        name="newSubgroup"
                                        onChange={this.handleChange}
                                        value={this.state.newSubgroup}
                                        disabled={this.state.creatingGroup}
                                        placeholder="Group Name: letters, numbers and spaces"
                                    />
                                    { this.state.invalidSubgroup && this.state.newSubgroup.length > 2 && 
                                        <div className="subgroupError">Registration groups must be longer than 2 characters and can only contain letters, numbers and spaces.</div>
                                    }
                                </div>
                                <div>
                                    <label htmlFor="">Event Description:</label><br /> 
                                    <input type="text" name="newSubgroupDescription" className="groupDescription" value={this.state.newSubgroupDescription} onChange={this.handleChange} />
                                </div>
                                <div>
                                    <input type="checkbox" name="newSubgroupEmailEnabled" checked={this.state.newSubgroupEmailEnabled} onChange={this.handleChange} />
                                    <label htmlFor="">Enable Email</label>
                                </div>
                                <div className="privateGroupToggle">
                                    <input type="checkbox" id="privateGroup" name="confidential" onChange={this.handleChange} checked={this.state.confidential} /> 
                                    <label htmlFor="privateGroup">Private Group</label>
                                </div>
                            </div>   
                        </ContentModal>
                    </div>
                    <div className="card-body">                                      
                        {
                            this.props.subgroups.map(subgroup => {
                                return <Subgroup key={subgroup.id} subgroup={subgroup} 
                                      deleteCallback={this.props.destroySubgroup} selectedGroup={this.props.groupName} 
                                      updateGroupName={this.updateGroupName} 
                                      groupNameBase={this.props.groupNameBase}
                                      displayGroupName={this.displayGroupName}
                                      private={subgroup.classification != "u"}
                                      email={subgroup.email}
                                    />
                            })
                        }   
                    </div>
                </div>
                <br />
                
                <div className="startRegistration">
                    <RegistrationModal confirmCallback={this.startRegistration} openButtonDisabled={!canStartRegistration} openButtonText="Start Registering Participants" /> &nbsp;
                </div>
                <br />

                <div className="card">
                    <div className="card-header">
                        <h2>Terms of Use</h2>                 
                    </div>
                    <div className="card-body">                                      
                            <ul className="TOS">
                                <li>* Application administrators are expected to have read and agreed to the <a target="_blank" href="https://uwnetid.washington.edu/agree/?accept=idaa&appid=idcardeventregistration">UW Institutional Data Access agreement</a>. Privacy expectations and appropriate use of personal data are the responsibility of the * application administrators.</li>

                                <li>The functionality contained in this application is explicitly for the use of capturing event participants. Any other use of the event participants’ information or Husky Card data elements (Name, NetID, Photo, Magstrip, RFID) information captured in the application is explicitly prohibited.</li>

                                <li>The use of the “Allow NetID Registration” feature should always be accompanied by a secondary form of identification (e.g. UW or government issued ID). The use of the “Allow NetID Registration” feature without secondary identification <u>and</u> the event participant or registrant’s physical presence is explicitly prohibited.</li>

                                <li>The “Private Group” feature should be used as the default setting and only * application administrators should be given access to view the event participants.</li>

                                <li>Use of the event participants’ information is to <u>only</u> be used for purposes directly related to the specific event the participant registered for or attended.</li>
                            </ul>
                            <i>* Application administrators are those individuals that have been setup to access the configruation screen and are required to login. If you are reading this message you are an application administrator.</i>
                    </div>
                </div>            
            </div>
        )
    }
}

const mapStateToProps = state => ({
   groupName: state.groupName,
   subgroups: state.subgroups,
   groupNameBase: state.groupNameBase
});
const mapDispatchToProps = dispatch => {
    return {
        updateGroupName: groupName => dispatch(UpdateGroupName(groupName)),
        loadSubgroups: groupName => dispatch(LoadSubgroups(groupName)),
        destroySubgroup: subgroup => dispatch(DestroySubgroup(subgroup)),
        loadUsers: group => dispatch(LoadUsers(group)),
        createGroup: (group, confidential, description, email) => dispatch(CreateGroup(group, confidential, description, email)),
        startRegistrationSession: (groupName, netidAllowed, tokenTTL) => dispatch(StartRegistrationSession(groupName, netidAllowed, tokenTTL)),
        stopRegistrationSession: () => dispatch(StopRegistrationSession())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Configure);