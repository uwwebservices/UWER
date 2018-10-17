import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ConfirmModal from 'Components/ConfirmModal';
import FA from 'react-fontawesome';

export default class Test extends React.Component {
    constructor(props) {
        super(props);
        this.state = {loadingUsers: false};
    }    
    reload = async () => {
        if(this.props.group){
            this.setState({loadingUsers: true});
            await this.props.reloadUsers(this.props.group);
            this.setState({loadingUsers: false});
        }
    }
    render() {
        const listItems = this.props.members.map(mem => {
            
            return (
                <ListItem
                    key={(mem.UWNetID || mem.identifier) + (Math.floor(Math.random() * 100)).toString()}
                    >
                    <Avatar src={mem.Base64Image} />
                    <ListItemText primary={mem.loading ? "Loading..." : mem.UWNetID} secondary={mem.DisplayName} />
                    { (mem.deleting || mem.loading) && <span className="loadSpinner"><FA name="spinner" spin={true} size="2x" /></span> 
                    }                   
                </ListItem> 
            )
        })
        return (                   
                <div className="memberList">                         
                    <List>
                        {listItems}
                    </List>
                </div>         
        )        
    }
}