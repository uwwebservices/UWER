import { createStore, applyMiddleware  } from 'redux';
import Reducer from './Reducers';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger'

const loggerMiddleware = createLogger();

export default createStore(
    Reducer, 
    applyMiddleware(
        thunk, 
        loggerMiddleware
    )
);