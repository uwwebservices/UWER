import React from 'react';
import ContentModal from 'Components/ContentModal';

const NODE_ENV = process.env.NODE_ENV;

class EndRegistrationModal extends React.Component {
  backToConfig() {
    if (NODE_ENV !== 'development') {
      window.location = '/login?returnUrl=/config';
    }
  }
  render() {
    let modalOpts = {
      openWithButton: true,
      dialogTitle: 'End Registation Mode',
      showCancelButton: this.showCancelButton,
      cancelButtonText: 'Back',
      approveButtonText: 'Done',
      openButtonText: 'End Registration',
      disableBackdropClick: true,
      cancelCallback: this.backToConfig,
      openButtonColor: 'secondary',
      modalText: 'Your registration session has been successfully ended.'
    };

    return (
      <ContentModal {...Object.assign({}, modalOpts, this.props)}>
        <div>
          <span>{this.props.modalText || modalOpts.modalText}</span>
          <iframe src="https://idp.u.washington.edu/idp/profile/Logout" height="335px" width="450px" />
        </div>
      </ContentModal>
    );
  }
}

export default EndRegistrationModal;
