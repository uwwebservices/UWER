import React from 'react';
import ContentModal from 'Components/ContentModal';

class EndRegistrationModal extends React.Component {
    backToConfig() {
        if(process.env.NODE_ENV !== "development") {
            window.location = "/login?returnUrl=/config";
        }
    }
    render() {
        let modalOpts = {
            dialogTitle: "End Registation Mode",
            cancelText: "Back",
            approveText: "End Registration",
            openButtonText: "End Registration",
            disableBackdropClick: true,
            cancelCallback: this.backToConfig,
            openButtonColor: "secondary",
            modalText: "Are you sure you want to end this registration session and fully log out?"
        };

        return (
            <ContentModal { ...Object.assign({}, modalOpts, this.props) }>
                <div>
                    <span>{this.props.modalText || modalOpts.modalText}</span>
                    <iframe src="https://idp.u.washington.edu/idp/profile/Logout" height="335px" width="450px"></iframe>
                </div>
            </ContentModal>
        )
    }
}

export default EndRegistrationModal;