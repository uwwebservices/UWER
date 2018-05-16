import { createStore, applyMiddleware  } from 'redux';
import RootReducer from './Reducers';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger'

const loggerMiddleware = createLogger();

export default createStore(
    RootReducer, 
    applyMiddleware(
        thunk, 
        loggerMiddleware
    )
);