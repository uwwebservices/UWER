import React from 'react';
import {Avatar, List, ListItem, FloatingActionButton} from 'material-ui'

export default class Test extends React.Component {
    removeUser(netid) {
       fetch('/api/register/' + netid, {
            method: 'DELETE'
        })
        .then(res => {
            this.props.reloadUsers();
            document.getElementById("registerCard").focus();
        })
        .catch(err => {
            console.log('could not remove user ' + err);
        })
    }
    render() {
        const listItems = this.props.members.map(mem => {
            return (
                <ListItem 
                    primaryText={mem.netid}
                    secondaryText={mem.preferredName}
                    leftAvatar={<Avatar src={mem.base64image} />}
                    key={mem.netid}
                    rightAvatar={<FloatingActionButton onClick={() => this.removeUser(mem.netid)} mini={true} secondary={true}>x</FloatingActionButton>}
                /> 
            )
        })
        return (
            <div className="memberList">
                <h2>Registered Participants</h2>
                <List>
                    {listItems}
                </List>
            </div>
        )
    }
}

{/* // <li key={mem.netid}>
// <img src={mem.base64image} width="20px"/>&nbsp; 
// {mem.preferredName}&nbsp; 
// ({mem.netid})&nbsp; 
// <a href="#" onClick={() => this.removeUser(mem.netid)}>x</a></li> */}