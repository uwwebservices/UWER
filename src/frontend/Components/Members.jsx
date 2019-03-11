import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ConfirmModal from 'Components/ConfirmModal';
import Chip from '@material-ui/core/Chip';
import FA from 'react-fontawesome';

export default class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loadingUsers: false };
  }
  removeUser = netid => {
    this.props.removeUser(this.props.group, netid);
    document.getElementById('registerCard').focus();
  };
  reload = async () => {
    if (this.props.group) {
      this.setState({ loadingUsers: true });
      await this.props.reloadUsers(this.props.group);
      this.setState({ loadingUsers: false });
    }
  };
  render() {
    const listItems = this.props.members.map(mem => {
      let showDelete = (this.props.authenticated || this.props.development) && !mem.deleting && !mem.loading;

      let isStudent = mem.EduPersonAffiliations && mem.EduPersonAffiliations.indexOf('student') > -1;
      let isEmployee = mem.EduPersonAffiliations && mem.EduPersonAffiliations.indexOf('employee') > -1;
      let isAlum = mem.EduPersonAffiliations && mem.EduPersonAffiliations.indexOf('alum') > -1;

      let badges = !mem.loading && (
        <span>
          {mem.UWNetID}
          {isStudent && <Chip label="S" title="Student" />}
          {isEmployee && <Chip label="E" title="Employee" />}
          {isAlum && <Chip label="A" title="Alum" />}
        </span>
      );
      let memberKey = (mem.UWNetID || mem.identifier) + Math.floor(Math.random() * 100).toString();
      return (
        <ListItem key={memberKey} className={mem.deleting ? 'memberDeleting' : ''}>
          <Avatar src={mem.Base64Image} />
          <ListItemText primary={badges || 'Loading...'} secondary={mem.DisplayName} classes={{ primary: 'memberDisplay' }} />
          {(mem.deleting || mem.loading) && (
            <span className="loadSpinner">
              <FA name="spinner" spin={true} size="2x" />
            </span>
          )}
          {showDelete && (
            <ConfirmModal
              openButtonIcon="remove"
              openButtonText=""
              openButtonVariant="fab"
              openButtonFabMini={true}
              confirmCallback={() => this.removeUser(mem.UWNetID)}
              dialogContent={`Are you sure you want to remove ${mem.UWNetID} from ${this.props.group
                .replace(this.props.groupNameBase, '')
                .replace(/-/g, ' ')}?`}
              dialogTitle={`Remove User?`}
            />
          )}
        </ListItem>
      );
    });
    return (
      <div className="memberList">
        {this.props.members.length > 0 && (
          <div>
            <h2>
              Registered Participants <FA name="refresh" onClick={this.reload} spin={this.state.loadingUsers} />
            </h2>
            <List>{listItems}</List>
          </div>
        )}
      </div>
    );
  }
}
