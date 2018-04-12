import React from 'react';
import ReactDom from 'react-dom';
import './css/style';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { createMuiTheme } from 'material-ui/styles';
import Register from './Containers/Register';
import Configure from './Containers/Configure';
import PageWrapper from './Containers/PageWrapper';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'


const theme = createMuiTheme({
    palette: {
      primary: {
        light: '#757ce8',
        main: '#4b2e83',
        dark: '#002884',
        contrastText: '#fff',
      },
      secondary: {
        light: '#ff7961',
        main: '#f44336',
        dark: '#ba000d',
        contrastText: '#000',
      },
    },
  });

class App extends React.Component {
    constructor(props) {
        super(props);
    }
    render () {
        return (
            <Router>
                <MuiThemeProvider theme={theme}>
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