import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { InitApp, CheckAuthentication } from '../Actions';
import Header from 'Components/Header';
import Footer from 'Components/Footer';
import Authorization from 'Components/Authorization';
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
    if (this.props.notifications.length) {
      this.props.notifications.forEach(n => {
        this._addNotification(n.title, n.message);
      });
    }
  }

  // level = ["success", "error", "warning", "info"]
  // position = tr (top right), tl (top left), tc (top center), br (bottom right), bl (bottom left), bc (bottom center)

  _addNotification = (title, message, level = 'info', position = 'tc', autoDismiss = 5) => {
    this._notificationSystem.addNotification({
      title,
      message,
      level,
      position,
      autoDismiss
    });
  };

  render() {
    const authenticated = this.props.authenticated;
    const pages = (authenticated && [{ isNavigable: true, path: '/register', display: 'View  Participants' }, { isNavigable: true, path: '/config', display: 'Config' }]) || [];

    const childrenWithProps = React.Children.map(this.props.children, child =>
      React.cloneElement(child, {
        _addNotification: this._addNotification,
        ...this.props
      })
    );
    return (
      <div className="pageWrapper">
        <NotificationSystem ref="notificationSystem" />
        <Header pages={pages} />
        <main>
          <Authorization
            authenticated={this.props.authenticated}
            loginRequired={this.props.loginRequired}
            iaaAuth={this.props.iaaAuth}
            iaaCheck={this.props.iaaCheck}
            iaaRequired={this.props.iaaRequired}
            checkAuthentication={this.props.checkAuthentication}
            path={this.props.location.pathname}
          >
            {childrenWithProps}
          </Authorization>
        </main>
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  authenticated: state.authenticated,
  notifications: state.notifications,
  iaaAuth: state.iaaAuth,
  iaaCheck: state.iaacheck
});
const mapDispatchToProps = dispatch => {
  return {
    initApp: () => dispatch(InitApp()),
    checkAuthentication: () => dispatch(CheckAuthentication())
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(PageWrapper)
);
