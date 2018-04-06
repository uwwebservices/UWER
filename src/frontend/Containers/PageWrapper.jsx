import React, { Component } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { Link } from 'react-router-dom';
import configurator from 'config/configurator';
let config = configurator.get();

export default class Main extends Component {
    render () {
        return (
            <div className="pageWrapper">
                <Header configEnabled={config.enableConfigAPI} />
                    <main>
                        {...this.props.children}
                    </main>
                <Footer />
            </div>
        )
    }
}