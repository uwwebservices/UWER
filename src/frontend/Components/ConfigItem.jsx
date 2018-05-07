import React, { Component } from 'react';

export default class Configure extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <div>
                <label htmlFor={this.props.itemName} className="configLabel">{this.props.itemName}</label>
                <input type="text" className="configInput" 
                    name={this.props.itemName} 
                    placeholder={this.props.itemName} 
                    value={this.props.itemValue} 
                    onChange={this.props.onChange}
                />
            </div>
        )
    }
}