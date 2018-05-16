import React from 'react';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import FA from 'react-fontawesome';

class AlertDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }
  
  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = confirmed => {
    this.setState({ open: false });
    if(confirmed) {
      this.props.confirmCallback();
    }
  };

  render() {
    return (
      <span>
        <Button variant="raised" color="secondary" onClick={this.handleClickOpen}><FA name="remove" />&nbsp;{this.props.buttonText || "Delete"}</Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{this.props.dialogTitle || ""}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {this.props.dialogContent || "Are you sure?"}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handleClose(false)} color="primary">
              { this.props.cancelText || "Cancel" }
            </Button>
            <Button onClick={() => this.handleClose(true)} color="primary" autoFocus>
            { this.props.approveText || "Delete" }
            </Button>
          </DialogActions>
        </Dialog>
      </span>
    );
  }
}

export default AlertDialog;