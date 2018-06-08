import React from 'react';
import {Avatar, List, ListItem, ListItemText, Button} from 'material-ui'
import FA from 'react-fontawesome';

export default class Test extends React.Component {
    constructor(props) {
        super(props);
        this.state = {loadingUsers: false};
    }
    removeUser = netid => {
        this.props.removeUser(this.props.group, netid);
        document.getElementById("registerCard").focus();
    }
    reload = async () => {
        this.setState({loadingUsers: true});
        await this.props.reloadUsers(this.props.group);
        this.setState({loadingUsers: false});
    }
    render() {
        const listItems = this.props.members.map(mem => {
            return (
                <ListItem
                    key={mem.UWNetID}>
                    <Avatar src={mem.Base64Image} />
                    <ListItemText primary={mem.UWNetID} secondary={mem.DisplayName} />
                    {this.props.authenticated && <Button variant="fab" onClick={() => this.removeUser(mem.UWNetID)} mini={true} color="primary">x</Button>}
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