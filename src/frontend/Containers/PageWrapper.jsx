import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { InitApp } from '../Actions';
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
        this.props.initApp();
        // Grabs notifications from the store and turns them into toasts
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
        const showHeader = this.props.authenticated || this.props.development;
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
                        { this.props.development && <div className="developmentNotice">Development Mode</div>}
                        { childrenWithProps }
                    </main>
                <Footer />
            </div>
        )
    }
}

const mapStateToProps = state => ({
    authenticated: state.authenticated,
    notifications: state.notifications,
    development: state.development
 });
 const mapDispatchToProps = dispatch => {
    return {
        initApp: () => dispatch(InitApp())
    }
}
 
 export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PageWrapper));