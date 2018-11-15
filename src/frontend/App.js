import React from 'react';
import ReactDom from 'react-dom';
import 'css/style';
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from 'css/materialTheme';
import Register from 'Containers/Register';
import Configure from 'Containers/Configure';
import Welcome from 'Containers/Welcome';
import PageWrapper from 'Containers/PageWrapper';
import NotAuthorized from 'Containers/NotAuthorized';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './Store.js';
     
// Passes all props down to children
const PorousRoute = function ({children, ...props }) {
    return (
            <Route path={props.path}>
                <PageWrapper {...props}>
                    { React.cloneElement(children, props) }
                </PageWrapper>
            </Route>
    );
}

class App extends React.Component {
    render () {
        return (
            <Router>
                <Provider store={store}>
                    <MuiThemeProvider theme={theme}>
                            <Switch>
                                <PorousRoute path='/config' loginRequired={true}><Configure /></PorousRoute>
                                <PorousRoute path='/register' loginRequired={false}><Register /></PorousRoute>
                                <PorousRoute path='/notAuthorized' loginRequired={false}><NotAuthorized /></PorousRoute>
                                <PorousRoute path='/' loginRequired={false}><Welcome /></PorousRoute>
                            </Switch>
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