import React, { Component } from 'react';

export default class Configure extends Component {
    render() {
        return (
            <button type="submit" className="submitButton">{this.props.display}</button>
        )
    }
}