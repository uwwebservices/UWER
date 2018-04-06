import React from 'react';
import ReactDom from 'react-dom';
import './css/style';
import Register from './Containers/Register';
import Configure from './Containers/Configure';
import PageWrapper from './Containers/PageWrapper';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

class App extends React.Component {
    constructor(props) {
        super(props);
    }
    render () {
        return (
            <Router>
                <Switch>
                    <Route path='/config' render={(routeProps) => (
                        <PageWrapper>
                            <Configure {...routeProps} />
                        </PageWrapper>
                    )} />
                    <Route path='/' render={(routeProps) => (
                        <PageWrapper>
                            <Register {...routeProps} />
                        </PageWrapper>
                    )} />
                </Switch>
            </Router>
        )
    }
}

ReactDom.render(
  <App />,
  document.getElementById('root')
);