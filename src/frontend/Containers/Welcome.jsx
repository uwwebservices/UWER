import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import Cookies from 'browser-cookies';
import { UpdateGroupName } from '../Actions';

class Welcome extends Component {
    componentDidMount() {
        setTimeout(() => {
            if (this.props.authenticated) {
                // Comment this out to test welcome screen in dev
                this.props.history.push("/config")
                return;
            }
        },0);
    }
    configure = () => {
        if(this.props.authenticated) {
            this.props.history.push("/config"); // skip auth in dev as we are already "auth"'d
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
const mapDispatchToProps = dispatch => {
    return {
        storeRegistrationToken: token => dispatch(StoreRegistrationToken(token)),
        updateGroupName: groupName => dispatch(UpdateGroupName(groupName))
    }
};
 
export default connect(mapStateToProps, mapDispatchToProps)(Welcome);