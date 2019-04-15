import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FA from 'react-fontawesome';
import DefaultUser from 'Assets/defaultUser';

export default class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loadingUsers: false };
  }
  reload = async () => {
    if (this.props.group) {
      this.setState({ loadingUsers: true });
      await this.props.reloadUsers(this.props.group);
      this.setState({ loadingUsers: false });
    }
  };
  render() {
    return this.props.members.map(mem => {
      let memberKey = mem.UWNetID || mem.identifier || Math.random().toString(36);
      return (
        <ListItem key={memberKey}>
          <Avatar src={DefaultUser} />
          <ListItemText primary={mem.loading ? 'Loading...' : mem.UWNetID} secondary={mem.DisplayName} />
          {(mem.deleting || mem.loading) && (
            <span className="loadSpinner">
              <FA name="spinner" spin={true} size="2x" />
            </span>
          )}
        </ListItem>
      );
    });
  }
}
