import React, { Component } from 'react';
import AddMemberForm from 'Components/AddMemberForm';
import Members from 'Components/Members';
import Button from '@material-ui/core/Button';
import RegistrationModal from 'Components/RegistrationModal';
import EndRegistrationModal from 'Components/EndRegistrationModal';
import { connect } from 'react-redux';
import { LoadUsers, AddUser, DeleteUser, StartRegistrationSession, StopRegistrationSession } from '../Actions';

class Register extends Component {
    componentDidUpdate() {
        setTimeout(() => {
            if(!this.props.authenticated && !this.props.token && !this.props.development) {
                this.props.history.push("/");
            }
        }, 0);
    }
    endRegistration = () => {
        this.props.stopRegistrationSession();
        this.props.history.push("/");
    }
    configRedirect = () => {
        this.props.history.push("/config");
    }
    render() {
        let adminMode = this.props.authenticated && this.props.groupName;
        let registrationDisabled = !this.props.groupName;
        return (
            <div>
                { registrationDisabled && (
                    <div className="registrationNotification">
                        <span>
                            Hey! You don't have a group name set for registration &nbsp;
                            </span>
                            <Button variant="raised" onClick={() => this.configRedirect()} color="primary">Finish Configuring</Button>
                    </div>
                )}
                { adminMode && (
                    <div className="registrationNotification">
                        <span>
                        Hey! It looks like you're still logged in, do you want to start kiosk mode? &nbsp;
                        </span>
                        {/* <Button variant="raised" onClick={() => this.props.startRegistrationSession()} color="primary">Start Registering</Button> */}
                        <RegistrationModal confirmCallback={this.props.startRegistrationSession} /> 
                    </div>
                )}
                <div className="registrationTable">                   
                   <div>
                        <h1>Event Registration</h1>                  
                   </div>
                   <div className="endRegistration">
                        <EndRegistrationModal confirmCallback={this.endRegistration} />
                   </div>
                </div>    
                <AddMemberForm addUser={this.props.addUser} group={this.props.groupName} formDisabled={registrationDisabled} />
                <Members members={this.props.users} reloadUsers={this.props.loadUsers} development={this.props.development} groupNameBase={this.props.groupNameBase} removeUser={this.props.removeUser} group={this.props.groupName} authenticated={this.props.authenticated} />
          </div>
        )
    }
}

const mapStateToProps = state => ({
    groupName: state.groupName,
    users: state.users,
    groupNameBase: state.config.groupNameBase,
    authenticated: state.authenticated,
    token: state.registrationToken,
    development: state.development
 });
 const mapDispatchToProps = dispatch => {
     return {
        loadUsers: group => dispatch(LoadUsers(group)),
        addUser: (group, user) => dispatch(AddUser(group, user)),
        removeUser: (group, user) => dispatch(DeleteUser(group, user)),
        startRegistrationSession: () => dispatch(StartRegistrationSession()),
        stopRegistrationSession: () => dispatch(StopRegistrationSession())
     }
 }
 
 export default connect(mapStateToProps, mapDispatchToProps)(Register);