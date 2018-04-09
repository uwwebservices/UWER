import React, { Component } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { Link } from 'react-router-dom';
import configurator from 'config/configurator';
let config = configurator.get();

const pages = [
    { isNavigable: true, path: "/", display: "Register" },
    { isNavigable: true, path: "/config", display: "Config"},
    { isNavigable: false, path: "/api/register/memberlist.csv", display: "CSV"}
];

export default class Main extends Component {
    render () {
        return (
            <div className="pageWrapper">
                <Header configEnabled={config.enableConfigAPI} pages={pages} />
                    <main>
                        {...this.props.children}
                    </main>
                <Footer />
            </div>
        )
    }
}