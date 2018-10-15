import React from 'react';

class RegistrationModal extends React.Component {
    render() {
        return (
            <div className="configOptions">
                <h2>Registration User Options</h2>
                <div className="options">
                    <input type="checkbox" id="netidAllowed" name="netidAllowed" checked={this.props.netidAllowed} onChange={this.props.handleChange} />
                    <label htmlFor="netidAllowed">Allow NetID Registration?</label><br />
                    <label htmlFor="tokenTTL">Allow registration for</label>
                    <input type="textbox" id="tokenTTL" name="tokenTTL" value={this.props.tokenTTL} onChange={this.props.handleChange} />
                    <span>minutes.</span>
                </div>
                {this.props.children}
            </div>
        )
    }
}

export default RegistrationModal;