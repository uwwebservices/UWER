import React from 'react';

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
        return (
            <div className="memberList">
                <h2>Registered Users</h2>
                <ul>
                    {
                        this.props.members.map(mem => {
                            return <li key={mem.netid}>
                                <img src={mem.base64image} width="20px"/>&nbsp; 
                                {mem.preferredName}&nbsp; 
                                ({mem.netid})&nbsp; 
                                <a href="#" onClick={() => this.removeUser(mem.netid)}>x</a></li>
                        })
                    }
                </ul>
            </div>
        )
    }
}