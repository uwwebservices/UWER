import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router'
import { InitApp } from '../Actions';
import Header from 'Components/Header';
import Footer from 'Components/Footer';

const pages = [
    { isNavigable: true, path: "/", display: "Register" },
    { isNavigable: true, path: "/config", display: "Config"}
];

class PageWrapper extends Component {
    async componentWillMount() {
        this.props.initApp();
    }
    render () {
        return (
            <div className="pageWrapper">
                <Header pages={pages} />
                    <main>
                        <div className="righted">
                            <div>{this.props.DisplayName && `Welcome ${this.props.DisplayName}`}</div>
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
    GroupNameBase: state.config.groupNameBase
 });
 const mapDispatchToProps = dispatch => {
    return {
        initApp: async () => await dispatch(InitApp()),
    }
}
 
 export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PageWrapper));