import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

export default class Form extends React.Component {
    registerUser = async e => {
        e.preventDefault();
        let identifier = e.target.registerCard.value;
        if(identifier.length) {
            // if identifier is a magstrip, remove the semicolon
            identifier = identifier[0] === ';' ? identifier.slice(1, -1) : identifier;
            this.props.addUser(this.props.group, identifier);
            document.getElementById("registerCard").value = "";
        }
    };

    render() {
        return (
            <form className="form" onSubmit={this.registerUser}>
                <TextField type="password" autocomplete="off" name="registerCard" id="registerCard" placeholder="magstrip/rfid/netid"  />
                <Button variant="raised" color="primary" type="submit">Register</Button>
            </form>
        )
    }
}