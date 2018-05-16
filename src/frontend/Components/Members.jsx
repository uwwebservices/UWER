import React from 'react';
import {Avatar, List, ListItem, ListItemText, Button} from 'material-ui'

export default class Test extends React.Component {
    removeUser = netid => {
        this.props.removeUser(netid);
        document.getElementById("registerCard").focus();
    }
    render() {
        const listItems = this.props.members.map(mem => {
            return (
                <ListItem
                    key={mem.netid}>
                    <Avatar src={mem.base64image} />
                    <ListItemText primary={mem.netid} secondary={mem.preferredName} />
                    <Button variant="fab" onClick={() => this.removeUser(mem.netid)} mini={true} color="primary">x</Button>
                </ListItem> 
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