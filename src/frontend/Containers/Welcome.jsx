import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';

class Welcome extends Component {
    constructor (props) {
        super(props);
        if(props.token) {
            //redirect to register?
            console.log("token present, continue registering");
        } else if (props.authenticated) {
            //redirect to config?
            console.log("authenticted, back to config to finish");
        } else {
            console.log("new user, lets get started")
        }
    }
    configure = () => {
        if(this.props.authenticated) {
            this.props.history.push("/config");
        } else {
            window.location = "/config";
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
const mapDispatchToProps = dispatch => {return {}};
 
export default connect(mapStateToProps, mapDispatchToProps)(Welcome);