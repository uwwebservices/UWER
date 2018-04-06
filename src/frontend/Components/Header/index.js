import { NavLink, Link } from 'react-router-dom';
import React, { Component } from 'react';

import './style';

export default class Header extends Component {
  render() {
    return (
      <nav id="uw-container">
        <div id="uw-container-inner">
            <header className="uw-thinstrip">
                <div className="uw-thin-strip-nav">
                    <ul className="uw-thin-links">
                        <li><NavLink exact to="/" activeClassName="active">Registration</NavLink></li>
                        <li>
                            {this.props.configEnabled && <NavLink exact to="/config" activeClassName="active">Config</NavLink>}
                        </li>
                        <li>
                            <Link to="/api/register/memberlist.csv" target="_blank">CSV</Link>
                        </li>
                    </ul>
                </div>

                <div className="header-container">
                    <a className="uw-patch" href="http://uw.edu" tabIndex="-1" title="University of Washington">&nbsp;</a> 
                    <a className="uw-wordmark" href="http://uw.edu" title="University of Washington">UW APIs</a>
                </div>
            </header>
        </div>
    </nav>
    );
  }
};

