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
    return this.props.members.map(mem => {
      let memberKey = mem.UWNetID || mem.identifier || Math.random().toString(36);
      let loadRealImg = true;
      const loadImgOnce = e => {
        if (loadRealImg) {
          loadRealImg = false;
          e.target.src = mem.Base64Image;
        }
      };
      const errImg = e => {
        e.target.src = DefaultUser;
      };
      return (
        <ListItem key={memberKey} className={mem.deleting ? 'fadeOutRemoval' : ''}>
          <Avatar onLoad={loadImgOnce} onError={errImg} src={DefaultUser} />
          <ListItemText primary={mem.loading ? 'Loading...' : mem.UWNetID} secondary={mem.DisplayName} />
          {!mem.loading && !mem.deleting && (
            <span className="loadSpinner">
              <FA name="user-secret" size="2x" />
            </span>
          )}
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
