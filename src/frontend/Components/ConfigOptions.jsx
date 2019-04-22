import React from 'react';

class ConfigOptions extends React.Component {
  render() {
    return (
      <div className="card">
        <div className="card-header">
          <h2>Registration Options</h2>
        </div>
        <div className="card-body">
          <div className="options">
            <p>
              <input type="checkbox" id="netidAllowed" name="netidAllowed" checked={this.props.netidAllowed} onChange={this.props.handleChange} />
              <label htmlFor="netidAllowed">Allow NetID Registration?</label>
            </p>
            <p>
              <label htmlFor="tokenTTL">Allow registration for </label>
              <input type="textbox" id="tokenTTL" name="tokenTTL" value={this.props.tokenTTL} onChange={this.props.handleChange} />
              <span> minutes.</span>
            </p>
          </div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default ConfigOptions;
