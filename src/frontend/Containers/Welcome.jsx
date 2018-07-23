import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';

class Welcome extends Component {
    componentDidMount() {
        if(!this.props.development) {
            setTimeout(() => {
                if (this.props.authenticated && !this.props.token) {
                    this.props.history.push("/config")
                    return;
                } else if(!this.props.authenticated && this.props.token) {
                    this.props.history.push("/register");
                    return;
                }
            },0);
        }
    }
    configure = () => {
        let path = window.location.pathname.split('/')[1];
        if(this.props.development) {
            this.props.history.push("config"); // skip auth redirect in dev as we are already "auth"'d
        } else {
            let path = window.location.pathname.split('/')[1];
            path = path ? "/"+path : path;
            window.location = `${path}/login?returnUrl=${path}config`;
        }
    }
    render() {
        return (
            <div>
                <h1>Welcome to Event Registry</h1>            
                <div>To get started, log in with your UWNetID and configure the application.</div><br />
                <Button variant="raised" color="primary" type="submit" onClick={this.configure}>Start Configuration</Button>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    token: state.registrationToken,
    authenticated: state.authenticated,
    development: state.development
});
const mapDispatchToProps = dispatch => {
    return {}
};
 
export default connect(mapStateToProps, mapDispatchToProps)(Welcome);