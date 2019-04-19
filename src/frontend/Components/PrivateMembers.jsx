import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FA from 'react-fontawesome';
import DefaultUser from 'Assets/defaultUser';

export default class Test extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.props.members && this.props.members.length != 0 ? (
      <ListItem key={Math.random().toString(36)}>
        <Avatar src={DefaultUser} />
        <ListItemText primary="Loading..." />
        <span className="loadSpinner">
          <FA name="spinner" spin={true} size="2x" />
        </span>
      </ListItem>
    ) : (
      <ListItem />
    );
  }
}
