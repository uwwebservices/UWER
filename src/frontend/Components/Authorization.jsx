import React from 'react';
import { connect } from 'react-redux';
import { CheckAuthentication } from '../Actions';
import FA from 'react-fontawesome';

class Authorization extends React.Component {
    async componentDidMount() {
        if(!this.props.authenticated && !this.props.development) {
            await this.props.checkAuthentication();
            if(!this.props.authenticated) {
                return window.location = "/login?returnUrl=/config";
            }
            if(!this.props.iaaAuth)
            {
                return window.location = this.props.iaaCheck;
            }
        }
    }
    render() {
        return (
            <div>
                This is the loading page. Checking auth. <FA name="spinner" spin={true} /> 
            </div>          
        )
    }
}

const mapStateToProps = state => ({
    authenticated: state.authenticated,
    development: state.development,
    iaaAuth: state.iaaAuth,
    iaaCheck: state.iaacheck
 });
 const mapDispatchToProps = dispatch => {
    return {
        checkAuthentication: () => dispatch(CheckAuthentication())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Authorization);