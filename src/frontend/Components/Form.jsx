import React from 'react';
import TextField from 'material-ui/TextField';
import {RaisedButton} from 'material-ui';

export default class Form extends React.Component {
    constructor (props) {
        super(props);
        this.state = { card: ""};
    }
    registerUser(e) {
        e.preventDefault();
        if(this.state.card) {
            let cardnum = this.state.card;
            if(cardnum[0] === ';') {
                cardnum = cardnum.slice(1, -1);
            }
            fetch('/api/register/' + cardnum + '?verbose=true', {
                method: 'PUT'
            }).then(res => res.json())
            .then(json => {
                this.props.addUser(json);
            })
            this.setState({ card: ""});
        }
    }
    
    updateCard(e) {
        this.setState({ card: e.target.value });
    }
    render() {
        return (
            <form className="form" onSubmit={this.registerUser.bind(this)}>
                <TextField type="text" placeholder="magstrip/rfid/netid" id="registerCard" value={this.state.card} onChange={this.updateCard.bind(this)} />
                <RaisedButton primary={true} type="submit">Register</RaisedButton>
            </form>
        )
    }
}