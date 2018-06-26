import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router'
import { InitApp, StoreRegistrationToken } from '../Actions';
import Header from 'Components/Header';
import Footer from 'Components/Footer';

const pages = [
    { isNavigable: true, path: "/register", display: "Register" },
    { isNavigable: true, path: "/config", display: "Config"}
];

function getParameterByName(name) {
    let url = window.location.toString();
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const stripToken = () => {
    var uri = window.location.toString();
    if (uri.indexOf("?") > 0) {
        let token = getParameterByName("token");
        var clean_uri = uri.substring(0, uri.indexOf("?"));
        window.history.replaceState({}, document.title, clean_uri);
        return token;
    }
}

class PageWrapper extends Component {
    componentWillMount() {
        let token = stripToken();
        token && this.props.storeRegistrationToken(token);
        this.props.initApp();
    }
    render () {
        return (
            <div className="pageWrapper">
                <Header pages={pages} />
                    <main>
                        <div className="righted">
                            <div>
                                { this.props.DisplayName && `Welcome ${this.props.DisplayName}`}
                                { this.props.authenticated && <span> | <a href="/logout">logout</a></span> }
                            </div>
                            <div>Group: {this.props.GroupNameBase && this.props.GroupName && this.props.GroupName.replace(this.props.GroupNameBase, "")}</div>
                        </div>
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
    authenticated: state.authenticated
 });
 const mapDispatchToProps = dispatch => {
    return {
        initApp: () => dispatch(InitApp()),
        storeRegistrationToken: token => dispatch(StoreRegistrationToken(token))
    }
}
 
 export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PageWrapper));