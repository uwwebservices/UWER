import React from 'react';
import ReactDom from 'react-dom';
import 'css/style';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import theme from 'css/materialTheme';
import Register from 'Containers/Register';
import Configure from 'Containers/Configure';
import PageWrapper from 'Containers/PageWrapper';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './Store.js';

class App extends React.Component {
    constructor(props) {
        super(props);
    }
    render () {
        return (
            <Provider store={store}>
                <MuiThemeProvider theme={theme}>
                    <Router>
                        <PageWrapper>
                            <Switch>
                                <Route path='/config' component={Configure} />
                                <Route exact path='/' component={Register} />
                            </Switch>
                        </PageWrapper>
                    </Router>
                </MuiThemeProvider>
            </Provider>
        )
    }
}

ReactDom.render(
  <App />,
  document.getElementById('root')
);