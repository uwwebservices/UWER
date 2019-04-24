import React from 'react';
import ContentModal from 'Components/ContentModal';

class RegistrationModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLogout: false
    };
  }
  render() {
    let modalOpts = {
      openWithButton: true,
      dialogTitle: 'Start Registation Mode',
      cancelButtonText: 'Back',
      approveButtonText: 'Start Registration',
      openButtonText: 'Registration Mode',
      disableBackdropClick: true,
      ...this.props
    };
    modalOpts.confirmCallback = async () => {
      this.setState({ showLogout: true });

      // Wait until the logout works OR we've tried too many times
      // This should allow the iFrame to load
      let count = 0;
      const maxCount = 15;
      while (count < maxCount) {
        count += 1;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };

    return (
      <ContentModal {...modalOpts}>
        <div>
          {this.state.showLogout ? (
            <iframe onLoad={this.props.confirmCallback} src="https://idp.u.washington.edu/idp/profile/Logout" height="335px" width="450px" />
          ) : (
            <p>
              Are you sure that you want to begin registration? <br />
              This will end your UW NetID sign-in session.
            </p>
          )}
        </div>
      </ContentModal>
    );
  }
}

export default RegistrationModal;
