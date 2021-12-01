import React from 'react';
import ContentModal from 'Components/ContentModal';

class RegistrationModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      showLogout: false,
      executeOnce: false,
      showApproveButton: true,
      showCancelButton: true
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
      showApproveButton: this.state.showApproveButton,
      showCancelButton: this.state.showCancelButton,
      ...this.props
    };

    modalOpts.confirmCallback = async () => {
      this.setState({ showLogout: true, count: this.state.count + 1, showApproveButton: false, showCancelButton: false });

      // Make sure we only call startRegistration once
      // Also probably janky, but consistently janky
      if (!this.state.executeOnce) {
        this.setState({ executeOnce: true });
        if (this.props.startRegistration) {
          this.props.startRegistration();
        } else if (this.props.endRegistration) {
          this.props.endRegistration();
        }
      }
    };

    return (
      <ContentModal {...modalOpts}>
        <div>{this.state.showLogout ? <iframe onLoad={modalOpts.confirmCallback} src="about:blank" height="0" width="0"/> : this.props.children}</div>
      </ContentModal>
    );
  }
}

export default RegistrationModal;
