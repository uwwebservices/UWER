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
            dialogTitle: "Start Registation Mode",
            cancelText: "Back",
            approveText: "Start Registration",
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