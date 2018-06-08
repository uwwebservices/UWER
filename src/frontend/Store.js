import { createStore, applyMiddleware  } from 'redux';
import RootReducer from './Reducers';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger'

let middleware = [thunk]

if(process.env.NODE_ENV === 'development') {
    const logger = createLogger();
    middleware.push(logger);
}

export default createStore(
    RootReducer, 
    applyMiddleware(
        ...middleware
    )
);