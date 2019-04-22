import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FA from 'react-fontawesome';

class ContentModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  handleClickOpen = () => this.setState({ open: true });

  handleClose = async confirmed => {
    const espcapeKeyPressed = confirmed && confirmed.keyCode && confirmed.keyCode == 27;
    if (confirmed && !espcapeKeyPressed) {
      await this.props.confirmCallback();
    } else {
      this.props.cancelCallback();
    }
    this.setState({ open: false });
  };

  render() {
    return (
      <span>
        {/* Should the modal output a button or an icon? */}
        {this.props.openWithButton && (
          <Button
            variant={this.props.openButtonVariant}
            disabled={this.props.openButtonDisabled}
            color={this.props.openButtonColor}
            onClick={this.handleClickOpen}
            mini={this.props.openButtonMini}
            className={this.props.openButtonClasses.join(' ')}
          >
            {this.props.openButtonIcon && (
              <span>
                <FA name={this.props.openButtonIcon} />
              </span>
            )}
            {this.props.openButtonText && <span> {this.props.openButtonText}</span>}
          </Button>
        )}
        {this.props.openWithIcon && <FA name={this.props.openButtonIcon} title={this.props.iconButtonTitle} onClick={this.handleClickOpen} />}

        <Dialog open={this.state.open} onClose={this.handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" disableBackdropClick={this.props.disableBackdropClick}>
          <DialogTitle id="alert-dialog-title">{this.props.dialogTitle}</DialogTitle>
          <DialogContent>{...this.props.children}</DialogContent>
          <DialogActions>
            {this.props.showCancelButton && (
              <Button onClick={() => this.handleClose(false)} variant="raised" color={this.props.cancelButtonColor} disabled={this.props.cancelButtonDisabled}>
                {this.props.cancelButtonText}
              </Button>
            )}
            {this.props.showApproveButton && (
              <Button onClick={() => this.handleClose(true)} variant="raised" color={this.props.approveButtonColor} autoFocus disabled={this.props.approveButtonDisabled}>
                {this.props.approveButtonText}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </span>
    );
  }
}

ContentModal.propTypes = {
  confirmCallback: PropTypes.func,
  cancelCallback: PropTypes.func,
  dialogTitle: PropTypes.string,
  children: PropTypes.node,
  cancelButtonText: PropTypes.string,
  showCancelButton: PropTypes.bool,
  showApproveButton: PropTypes.bool,
  approveButtonText: PropTypes.node,
  approveButtonColor: PropTypes.oneOf(['default', 'primary', 'secondary']),
  approveButtonDisabled: PropTypes.bool,
  openButtonText: PropTypes.string,
  openButtonIcon: PropTypes.string,
  openButtonVariant: PropTypes.oneOf(['text', 'flat', 'outlined', 'contained', 'raised', 'fab', 'extendedFab']),
  openButtonColor: PropTypes.oneOf(['default', 'primary', 'secondary']),
  openButtonMini: PropTypes.bool,
  openButtonClasses: PropTypes.arrayOf(PropTypes.string),
  disableBackdropClick: PropTypes.bool,
  openButtonDisabled: PropTypes.bool,
  openWithButton: PropTypes.bool,
  openWithIcon: PropTypes.bool,
  iconButtonTitle: PropTypes.string
};
ContentModal.defaultProps = {
  dialogTitle: '',
  cancelButtonText: 'Cancel',
  cancelButtonColor: 'default',
  showCancelButton: true,
  showApproveButton: true,
  approveButtonText: 'Continue',
  approveButtonColor: 'primary',
  approveButtonDisabled: false,
  openButtonText: 'Open Modal',
  openButtonIcon: '',
  openButtonVariant: 'raised',
  openButtonColor: 'primary',
  openButtonMini: false,
  openButtonClasses: [],
  confirmCallback: () => {},
  cancelCallback: () => {},
  disableBackdropClick: false,
  openButtonDisabled: false,
  openWithButton: false,
  openWithIcon: false,
  iconButtonTitle: ''
};

export default ContentModal;
