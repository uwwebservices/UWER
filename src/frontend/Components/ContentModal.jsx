import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import FA from 'react-fontawesome';

class ContentModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }
  
  handleClickOpen = () => this.setState({ open: true });

  handleClose = confirmed => {
    this.setState({ open: false });
    if(confirmed) {
      this.props.confirmCallback();
    } else {
      this.props.cancelCallback();
    }
  };

  render() {
    return (
      <span>
        <Button variant={this.props.openButtonVariant} disabled={this.props.openButtonDisabled} color={this.props.openButtonColor} onClick={this.handleClickOpen}>
          { this.props.openButtonIcon && <span><FA name={this.props.openButtonIcon} />&nbsp; </span>}
          { this.props.openButtonText }
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          disableBackdropClick={this.props.disableBackdropClick}
        >
          <DialogTitle id="alert-dialog-title">{this.props.dialogTitle }</DialogTitle>
          <DialogContent>
            { ...this.props.children }
          </DialogContent>
          <DialogActions>
            { this.props.showCancelButton &&
            <Button onClick={() => this.handleClose(false)} variant="raised" color={this.props.cancelButtonColor}>
              { this.props.cancelText }
            </Button>}
            <Button onClick={() => this.handleClose(true)} variant="raised" color={this.props.approveButtonColor} autoFocus>
            { this.props.approveText}
            </Button>
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
  cancelText: PropTypes.string,
  showCancelButton: PropTypes.bool,
  approveText: PropTypes.string,
  approveButtonColor: PropTypes.oneOf([ 'default', 'primary', 'secondary']),
  openButtonText: PropTypes.string,
  openButtonIcon: PropTypes.string,
  openButtonVariant: PropTypes.string,
  openButtonColor: PropTypes.oneOf([ 'default', 'primary', 'secondary']),
  disableBackdropClick: PropTypes.bool,
  openButtonDisabled: PropTypes.bool
};
ContentModal.defaultProps = {
  dialogTitle: "",
  cancelText: "Cancel",
  cancelButtonColor: "default",
  showCancelButton: true,
  approveText: "Continue",
  approveButtonColor: "primary",
  openButtonText: "Open Modal",
  openButtonIcon: "",
  openButtonVariant: "raised",
  openButtonColor: "primary",
  confirmCallback: () => {},
  cancelCallback: () => {},
  disableBackdropClick: false,
  openButtonDisabled: false
}

export default ContentModal;