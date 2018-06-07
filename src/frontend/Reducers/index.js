import { RECEIVE_GROUP_NAME, RECEIVE_CONFIG, RECEIVE_SUBGROUPS, DELETE_SUBGROUP, RECEIVE_USERS, UPDATE_USERS, REMOVE_USER, USER_AUTHENTICATION } from '../Constants';

const initialState = {
  groupName: "",
  config: {},
  subgroups: [],
  users: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_GROUP_NAME:
      return Object.assign({}, state, { groupName: action.groupName });
    case RECEIVE_CONFIG:
      return Object.assign({}, state, { config: action.config });
    case RECEIVE_SUBGROUPS:
      return Object.assign({}, state, { subgroups: action.subgroups });
    case DELETE_SUBGROUP:
      let subgroups = state.subgroups.filter(sg => sg !== action.subgroup);
      return Object.assign({}, state, {subgroups});
    case RECEIVE_USERS:
      return Object.assign({}, state, {users: action.users});
    case UPDATE_USERS:
      let newUsers = state.users.filter(u => u.UWRegID !== action.user.UWRegID);
      return Object.assign({}, state, {users: [...newUsers, action.user]});
    case REMOVE_USER:
      let users = state.users.filter(u => u.UWNetID !== action.user);
      return Object.assign({}, state, {users});
    case USER_AUTHENTICATION:
      return Object.assign({}, state, {authenticated: action.authenticated})
    default:
      return state;
  }
}