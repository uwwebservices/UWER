import React from 'react';
import ReactDom from 'react-dom';
import '../css/style.scss';
import Main from './components/Main.jsx';

class App extends React.Component {
    render () {
        return (
            <Main />
        )
    }
}

ReactDom.render(
  <App />,
  document.getElementById('root')
);