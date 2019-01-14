import React from 'react';
import ContentModal from 'Components/ContentModal';

class RegistrationModal extends React.Component {
    backToConfig() {
        if(process.env.NODE_ENV !== "development") {
            window.location = "/login?returnUrl=/config";
        }
    }
    render() {
        let modalOpts = {
            openWithButton: true,
            dialogTitle: "Start Registation Mode",
            cancelButtonText: "Back",
            approveButtonText: "Start Registration",
            openButtonText: "Registration Mode",
            disableBackdropClick: true,
            cancelCallback: this.backToConfig
        };

        return (
            <ContentModal { ...Object.assign({}, modalOpts, this.props) }>
                <div>
                    <iframe src="https://idp.u.washington.edu/idp/profile/Logout" height="335px" width="450px"></iframe>
                </div>
            </ContentModal>
        )
    }
}

export default RegistrationModal;