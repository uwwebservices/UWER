import React, { Component } from 'react';
import Header from 'Components/Header';
import Footer from 'Components/Footer';

const pages = [
    { isNavigable: true, path: "/", display: "Register" },
    { isNavigable: true, path: "/config", display: "Config"}
];

export default class PageWrapper extends Component {
    render () {
        return (
            <div className="pageWrapper">
                <Header pages={pages} />
                    <main>
                        {...this.props.children}
                    </main>
                <Footer />
            </div>
        )
    }
}