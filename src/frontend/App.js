import React from 'react';
import ReactDom from 'react-dom';
import './css/style';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {deepPurple400, white} from 'material-ui/styles/colors';
import Register from './Containers/Register';
import Configure from './Containers/Configure';
import PageWrapper from './Containers/PageWrapper';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

const muiTheme = getMuiTheme({
    palette: {
        primary1Color: deepPurple400,
        primaryTextColor: white
    }
  });

class App extends React.Component {
    constructor(props) {
        super(props);
    }
    render () {
        return (
            <Router>
                <MuiThemeProvider muiTheme={muiTheme}>
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