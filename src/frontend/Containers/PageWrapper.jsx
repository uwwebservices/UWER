import React, { Component } from 'react';
import Header from 'Components/Header';
import Footer from 'Components/Footer';
import { connect } from 'react-redux';

const pages = [
    { isNavigable: true, path: "/", display: "Register" },
    { isNavigable: true, path: "/config", display: "Config"}
];

class PageWrapper extends Component {
    render () {
        return (
            <div className="pageWrapper">
                <Header pages={pages} />
                    <main>
                        <div className="righted">{this.props.DisplayName && `Welcome ${this.props.DisplayName}`}</div>
                        {...this.props.children}
                    </main>
                <Footer />
            </div>
        )
    }
}

const mapStateToProps = state => ({
    UWNetID: state.auth.UWNetID,
    DisplayName: state.auth.DisplayName
 });
 
 export default connect(mapStateToProps)(PageWrapper);