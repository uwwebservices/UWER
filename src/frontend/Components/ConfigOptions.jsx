import React from 'react';

class RegistrationModal extends React.Component {
    render() {
        return (
            <div className="configOptions">
                <h2>Registration User Options</h2>
                <input type="checkbox" id="netidAllowed" value={this.props.netidAllowed} onChange={this.props.handleChange} />
                <label htmlFor="netidAllowed">Allow NetID Registration?</label>
            </div>
        )
    }
}

export default RegistrationModal;