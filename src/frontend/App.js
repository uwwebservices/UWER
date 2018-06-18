import React from 'react';
import ReactDom from 'react-dom';
import 'css/style';
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from 'css/materialTheme';
import Register from 'Containers/Register';
import Configure from 'Containers/Configure';
import PageWrapper from 'Containers/PageWrapper';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './Store.js';

class App extends React.Component {
    render () {
        return (
            <Router>
                <Provider store={store}>
                    <MuiThemeProvider theme={theme}>
                        <PageWrapper>
                            <Switch>
                                <Route path='/config' component={Configure} />
                                <Route exact path='/' component={Register} />
                            </Switch>
                        </PageWrapper>
                    </MuiThemeProvider>
                </Provider>
            </Router>
        )
    }
}

ReactDom.render(
  <App />,
  document.getElementById('root')
);