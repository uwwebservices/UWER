import React from 'react';
import Test from './Test.jsx';

export default class Main extends React.Component {
    render () {
        return (
            <div>
                <h1>Main Component!</h1>
                <Test />
            </div>
        )
    }
}