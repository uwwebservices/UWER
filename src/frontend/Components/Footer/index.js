import React from 'react';
import style from './style';

const Footer = () => {
    return (
      <footer className={style['uw-footer']}>
        Enterprise Web Services and Events
        <div>v{REACT_APP_VERSION}</div>
      </footer>
    )
}

export default Footer;
