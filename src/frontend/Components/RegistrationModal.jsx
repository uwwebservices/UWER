import React from 'react';
import ContentModal from 'Components/ContentModal';

class RegistrationModal extends React.Component {
    backToConfig() {
        if(process.env.NODE_ENV !== "development") {
            window.location = "/login?returnUrl=/config";
        }
    }
    render() {
        // confirmCallback: PropTypes.func,
        // cancelCallback: PropTypes.func,
        // dialogTitle: PropTypes.string,
        // children: PropTypes.node,
        // cancelText: PropTypes.string,
        // approveText: PropTypes.string,
        // approveButtonColor: PropTypes.oneOf([ 'default', 'primary', 'secondary']),
        // openButtonText: PropTypes.string,
        // openButtonIcon: PropTypes.string,
        // openButtonVariant: PropTypes.string,
        // openButtonColor: PropTypes.oneOf([ 'default', 'primary', 'secondary'])

        let modalOpts = {
            dialogTitle: "Start Registation Mode",
            cancelText: "Back to Config",
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