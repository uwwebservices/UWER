import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Cookies from 'browser-cookies';
import { InitApp, StoreRegistrationToken, UpdateGroupName } from '../Actions';
import Header from 'Components/Header';
import Footer from 'Components/Footer';
import NotificationSystem from 'react-notification-system';

class PageWrapper extends Component {
    constructor(props) {
        super(props);
        this.props.initApp();
        this._notificationSystem = null;
    }
    componentDidMount() {
        this._notificationSystem = this.refs.notificationSystem;
    }
    componentDidUpdate() {
        // Grabs notifications from the store and turns them into toasters
        if(this.props.notifications.length) {
            this.props.notifications.forEach(n => {
                this._addNotification(n.title, n.message);
            });
        }
    }

    // level = ["success", "error", "warning", "info"]
    // position = tr (top right), tl (top left), tc (top center), br (bottom right), bl (bottom left), bc (bottom center)

    _addNotification = (title, message, level="info", position="tr", autoDismiss=5) => {
        this._notificationSystem.addNotification({
            title,
            message,
            level,
            position,
            autoDismiss
        });
    }


    render () {
        const showHeader = this.props.authenticated;
        const pages = showHeader && [
            { isNavigable: true, path: "/register", display: "Register" },
            { isNavigable: true, path: "/config", display: "Config"}
        ] || [];

        const childrenWithProps = React.Children.map(this.props.children, child => React.cloneElement(child, { 
            _addNotification: this._addNotification,
            ...this.props
        }));

        return (
            <div className="pageWrapper">
                <NotificationSystem ref="notificationSystem" />
                <Header pages={pages} />
                    <main>
                        { childrenWithProps }
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
    token: state.registrationToken,
    notifications: state.notifications
 });
 const mapDispatchToProps = dispatch => {
    return {
        initApp: () => dispatch(InitApp()),
        storeRegistrationToken: token => dispatch(StoreRegistrationToken(token)),
        updateGroupName: groupName => dispatch(UpdateGroupName(groupName))
    }
}
 
 export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PageWrapper));