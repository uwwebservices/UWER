import React from 'react';
import ReactDom from 'react-dom';
import './css/style';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
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
                <MuiThemeProvider>
                    <PageWrapper>
                        <Switch>
                            <Route path='/config' component={Configure} />
                            <Route exact path='/' component={Register} />
                        </Switch>
                    </PageWrapper>
                </MuiThemeProvider>
            </Router>
        )
    }
}

ReactDom.render(
  <App />,
  document.getElementById('root')
);