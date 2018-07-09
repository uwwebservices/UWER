import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import ConfirmModal from 'Components/ConfirmModal';
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
            let showDelete = this.props.authenticated && !mem.deleting && !mem.loading;
            return (
                <ListItem
                    key={mem.UWNetID || mem.identifier}
                    className={mem.deleting ? "memberDeleting" : ""}>
                    <Avatar src={mem.Base64Image} />
                    <ListItemText primary={mem.loading ? "Loading..." : mem.UWNetID} secondary={mem.DisplayName} />
                    { showDelete &&  (
                        <ConfirmModal openButtonIcon="remove" openButtonText="" 
                            openButtonVariant="fab" openButtonFabMini={true} 
                            confirmCallback={() => this.removeUser(mem.UWNetID)} 
                            dialogContent={`Are you sure you want to remove ${mem.UWNetID} from ${this.props.group}?`} 
                            dialogTitle={`Remove User?`} 
                        />
                    )}
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