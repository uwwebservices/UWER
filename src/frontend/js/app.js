import React from 'react';
import ReactDom from 'react-dom';
import '../css/style.css';
import Main from './components/main.jsx';

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