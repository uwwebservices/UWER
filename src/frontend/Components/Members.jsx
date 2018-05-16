import React from 'react';
import {Avatar, List, ListItem, ListItemText, Button} from 'material-ui'
import FA from 'react-fontawesome';

export default class Test extends React.Component {
    constructor(props) {
        super(props);
        this.state = {loadingUsers: false};
    }
    removeUser = netid => {
        this.props.removeUser(netid);
        document.getElementById("registerCard").focus();
    }
    reload = async () => {
        this.setState({loadingUsers: true});
        await this.props.reloadUsers()
        this.setState({loadingUsers: false});
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
                <h2>Registered Participants <FA name="refresh" onClick={this.reload} spin={this.state.loadingUsers}/></h2>
                <List>
                    {listItems}
                </List>
            </div>
        )
    }
}