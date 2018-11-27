import React, { Component } from 'react';
import AddMemberForm from 'Components/AddMemberForm';
import Members from 'Components/Members';
import PrivateMembers from 'Components/PrivateMembers';
import Button from '@material-ui/core/Button';
import EndRegistrationModal from 'Components/EndRegistrationModal';
import { connect } from 'react-redux';
import { LoadUsers, AddUser, DeleteUser, StartRegistrationSession, StopRegistrationSession } from '../Actions';
import Cookies from 'browser-cookies';

class Register extends Component {
    componentDidUpdate() {
        setTimeout(() => {
            if(!this.props.authenticated && !this.props.token && !this.props.development) {
                if(!Cookies.get('registrationToken')) {
                    this.props.history.push("/");
                }
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
        let confidential = this.props.confidential;
        return (
            <div>
                { (registrationDisabled || adminMode) && (
                    <div className="registrationNotification">
                        { registrationDisabled && <span>
                            You must first select a group to begin registration &nbsp;
                        </span>}
                        { adminMode &&  <span>
                        Hey! It looks like you're still logged in, do you want to start kiosk mode? &nbsp;
                        </span>}
                        <Button variant="raised" onClick={() => this.configRedirect()} color="primary" className="righty">Finish Configuring</Button>
                    </div>
                )}                
                <div className="righted inline">
                    <EndRegistrationModal confirmCallback={this.endRegistration} showCancelButton={false} />
                </div>
                <div>
                    <h1 className="inline">Event Registration</h1>               
                </div>
                <AddMemberForm 
                    addUser={this.props.addUser} 
                    group={this.props.groupName} 
                    formDisabled={registrationDisabled} />
               { !this.props.confidential ? (  
                        <Members 
                            members={this.props.users} 
                            reloadUsers={this.props.loadUsers} 
                            development={this.props.development} 
                            groupNameBase={this.props.groupNameBase} 
                            removeUser={this.props.removeUser} 
                            group={this.props.groupName} 
                            authenticated={this.props.authenticated} />
                    ) : (
                        <PrivateMembers 
                            members={this.props.users}  />
                    )
                }
          </div>
        )
    }
}

const mapStateToProps = state => ({
    confidential: state.confidential,
    groupName: state.groupName,
    users: state.users,
    groupNameBase: state.groupNameBase,
    authenticated: state.authenticated,
    token: state.registrationToken,
    development: state.development,
    netidAllowed: state.netidAllowed
 });
 const mapDispatchToProps = dispatch => {
     return {
        loadUsers: group => dispatch(LoadUsers(group)),
        addUser: (group, user) => dispatch(AddUser(group, user)),
        removeUser: (group, user) => dispatch(DeleteUser(group, user)),
        startRegistrationSession: (groupName, netidAllowed) => dispatch(StartRegistrationSession(groupName, netidAllowed)),
        stopRegistrationSession: () => dispatch(StopRegistrationSession())
     }
 }
 
 export default connect(mapStateToProps, mapDispatchToProps)(Register);