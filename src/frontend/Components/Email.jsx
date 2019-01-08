import React from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import FA from 'react-fontawesome';

class MailDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          open: false,
        };
      }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    return (
      <span>
        <IconButton size="small" class="fa fa-envelope-o" onClick={this.handleClickOpen} >           
        </IconButton>
   
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Group Email"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
            {this.props.emailText}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary" autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </span>
    );
  }
}

MailDialog.propTypes = {
    emailText: PropTypes.string
  };
  MailDialog.defaultProps = {
   emailText:""
  };

export default MailDialog;