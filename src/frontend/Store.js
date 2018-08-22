import { createStore, applyMiddleware  } from 'redux';
import RootReducer from './Reducers';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger'

let middleware = [thunk];

console.log("REDUX_LOGGING", process.env.REDUX_LOGGING);
console.log("NODE_ENV", process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development' || process.env.REDUX_LOGGING) {
    const logger = createLogger();
    middleware.push(logger);
}

export default createStore(
    RootReducer, 
    applyMiddleware(
        ...middleware
    )
);