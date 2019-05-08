import { createStore, applyMiddleware } from 'redux';
import { RootReducer, initialState } from './Reducers';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

let middleware = [thunk];

if (process.env.NODE_ENV === 'development') {
  const logger = createLogger();
  middleware.push(logger);
}

if (!localStorage.getItem('reduxState')) {
  localStorage.setItem('reduxState', JSON.stringify(initialState));
}

const store = createStore(RootReducer, JSON.parse(localStorage.getItem('reduxState')), applyMiddleware(...middleware));

store.subscribe(() => {
  localStorage.setItem('reduxState', JSON.stringify(store.getState()));
});

export default store;
