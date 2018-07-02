import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Cookies from 'browser-cookies';
import { InitApp, StoreRegistrationToken, UpdateGroupName } from '../Actions';
import Header from 'Components/Header';
import Footer from 'Components/Footer';

class PageWrapper extends Component {
    constructor(props) {
        super(props);
        let groupName = Cookies.get('groupName');
        if(groupName && !props.GroupName) {
            props.updateGroupName(groupName);
        }
        let registrationToken = Cookies.get('registrationToken');
        if(registrationToken && !props.token) {
            props.storeRegistrationToken(token);
        }
    }
    componentWillMount() {
        this.props.initApp();
    }
    render () {
        const showHeader = this.props.authenticated && !this.props.token;
        const pages = showHeader && [
            { isNavigable: true, path: "/register", display: "Register" },
            { isNavigable: true, path: "/config", display: "Config"}
        ] || [];
        return (
            <div className="pageWrapper">
                <Header pages={pages} />
                    <main>
                        {...this.props.children}
                    </main>
                <Footer />
            </div>
        )
    }
}

const mapStateToProps = state => ({
    UWNetID: state.auth.UWNetID,
    DisplayName: state.auth.DisplayName,
    GroupName: state.groupName,
    GroupNameBase: state.config.groupNameBase,
    authenticated: state.authenticated,
    token: state.registrationToken
 });
 const mapDispatchToProps = dispatch => {
    return {
        initApp: () => dispatch(InitApp()),
        storeRegistrationToken: token => dispatch(StoreRegistrationToken(token)),
        updateGroupName: groupName => dispatch(UpdateGroupName(groupName))
    }
}
 
 export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PageWrapper));