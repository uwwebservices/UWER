import { NavLink, Link } from 'react-router-dom';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import s from './style';

class Header extends Component {
  getListItems() {
    return this.props.pages.map((p, idx) => {
        if(!p.isNavigable) {
            return <li key={idx}><Link to={p.path} target="_blank">{p.display}</Link></li>
        }
        return <li key={idx}><NavLink exact to={p.path} activeClassName={s["active"]}>{p.display}</NavLink></li>
      });
  }
  render() {
    return (
      <nav id={s["uw-container"]}>
        <div id={s["uw-container-inner"]}>
            <header className={s["uw-thinstrip"]}>
                <div className={s["uw-thin-strip-nav"]}>
                    <ul className={s["uw-thin-links"]}>
                        {this.getListItems()}
                    </ul>
                </div>

                <div className={s["header-container"]}>
                    <a className={s["uw-patch"]} href={this.props.url} tabIndex="-1" title={this.props.title}>&nbsp;</a> 
                    <a className={s["uw-wordmark"]} href={this.props.url} title={this.props.title}></a>
                </div>
            </header>
        </div>
    </nav>
    );
  }
};

Header.propTypes = {
    pages: PropTypes.arrayOf(
        PropTypes.shape({
            isNavigable: PropTypes.bool,
            path: PropTypes.string,
            display: PropTypes.string
        })
    ),
    title: PropTypes.string,
    url: PropTypes.string
};
Header.defaultProps = {
    pages: [],
    title: "University of Washington",
    url: "http://uw.edu"
}

export default Header;