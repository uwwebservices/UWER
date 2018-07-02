import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import Cookies from 'browser-cookies';
import { UpdateGroupName } from '../Actions';

class Welcome extends Component {
    constructor (props) {
        super(props);

        // if we have a token, we shoud go back to registering
        if(Cookies.get('registrationToken')) {
            props.storeRegistrationToken(Cookies.get('registrationToken'));
            props.history.push("/register");
            return;
        }

        

        // throw at end of stack to give authentication some time -- may need tweaking
        setTimeout(() => {
            if (this.props.authenticated) {
                console.log("authenticted, back to config to finish");
                // Comment this out to test welcome screen in dev
                //this.props.history.push("/config")
                return;
            } else {
                console.log("guess we have a new user, they can hang here")
            }
        },0);
        
    }
    configure = () => {
        // This is just for development ease, skip shib locally
        if(this.props.authenticated) {
            this.props.history.push("/config");
        } else {
            window.location = "/login?returnUrl=/config";
        }
    }
    render() {
        return (
            <div>
                <h1>Welcome to Event Registry</h1>            
                <div>To get started, log in with your UWNetID and configure the application.</div>
                <Button variant="raised" color="primary" type="submit" onClick={this.configure}>Start Configuration</Button>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    token: state.registrationToken,
    authenticated: state.authenticated
});
const mapDispatchToProps = dispatch => {return {
    storeRegistrationToken: token => dispatch(StoreRegistrationToken(token)),
    updateGroupName: groupName => dispatch(UpdateGroupName(groupName))
}};
 
export default connect(mapStateToProps, mapDispatchToProps)(Welcome);