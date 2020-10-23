import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import PropTypes from 'prop-types';
import FA from 'react-fontawesome';

class AlertDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  handleClose = confirmed => {
    this.setState({ open: false });
    const espcapeKeyPressed = confirmed && confirmed.keyCode && confirmed.keyCode == 27;
    if (confirmed && !espcapeKeyPressed) {
      this.props.confirmCallback();
    }
  };

  handleExited = () => {
    this.props.exitedCallback();
  };

  render() {
    return (
      <span>
        <Button
          variant={this.props.openButtonVariant}
          disabled={this.props.openButtonDisabled}
          color={this.props.openButtonColor}
          onClick={() => this.setState({ open: true })}
        >
          {this.props.openButtonIcon && <FA name={this.props.openButtonIcon} spin={this.props.openButtonIconSpin} />}
          {this.props.openButtonText ? <span className="padLeft">{this.props.openButtonText}</span> : ''}
        </Button>
        <Dialog open={this.state.open} onClose={this.handleClose} onExited={this.handleExited} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" disableBackdropClick={this.props.disableBackdropClick}>
          <DialogTitle id="alert-dialog-title">{this.props.dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{this.props.dialogContent}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handleClose(false)} color={this.props.approveButtonColor} variant={this.props.approveButtonVariant}>
              {this.props.cancelButtonText}
            </Button>
            <Button onClick={() => this.handleClose(true)} color={this.props.cancelButtonColor} variant={this.props.cancelButtonVariant} autoFocus>
              {this.props.approveButtonText}
            </Button>
          </DialogActions>
        </Dialog>
      </span>
    );
  }
}

AlertDialog.propTypes = {
  confirmCallback: PropTypes.func,
  exitedCallback: PropTypes.func,
  dialogTitle: PropTypes.string,
  dialogContent: PropTypes.string,
  cancelButtonText: PropTypes.string,
  cancelButtonColor: PropTypes.oneOf(['default', 'primary', 'secondary']),
  cancelButtonVariant: PropTypes.string,
  approveButtonText: PropTypes.string,
  approveButtonColor: PropTypes.oneOf(['default', 'primary', 'secondary']),
  approveButtonVariant: PropTypes.string,
  disableBackdropClick: PropTypes.bool,
  openButtonText: PropTypes.string,
  openButtonVariant: PropTypes.string,
  openButtonIcon: PropTypes.string,
  openButtonIconSpin: PropTypes.bool,
  openButtonColor: PropTypes.oneOf(['default', 'primary', 'secondary']),
  openButtonDisabled: PropTypes.bool
};
AlertDialog.defaultProps = {
  exitedCallback: () => {},
  dialogTitle: '',
  dialogContent: 'Are you sure?',
  cancelButtonText: 'Cancel',
  cancelButtonColor: 'secondary',
  cancelButtonVariant: 'contained',
  approveButtonText: 'Delete',
  approveButtonColor: 'default',
  approveButtonVariant: 'contained',
  disableBackdropClick: true,
  openButtonText: 'Delete',
  openButtonVariant: 'contained',
  openButtonIcon: 'remove',
  openButtonIconSpin: false,
  openButtonColor: 'secondary',
  openButtonDisabled: false
};

export default AlertDialog;
