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

const persistedState = JSON.parse(localStorage.getItem('reduxState'));

const store = createStore(RootReducer, persistedState, applyMiddleware(...middleware));

store.subscribe(() => {
  let state = { ...store.getState() };
  state.users = initialState.users;
  state.loading = initialState.loading;
  state.subgroups = initialState.subgroups;
  localStorage.setItem('reduxState', JSON.stringify(state));
});

export default store;
