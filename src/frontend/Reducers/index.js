import { RECEIVE_GROUP_NAME, RECEIVE_CONFIG, RECEIVE_SUBGROUPS, DELETE_SUBGROUP, RECEIVE_USERS, UPDATE_USERS, REMOVE_USER } from '../Constants';

const initialState = {
  groupName: "",
  config: {},
  subgroups: [],
  users: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_GROUP_NAME:
      return Object.assign({}, state, {
        groupName: action.groupName
      });
    case RECEIVE_CONFIG:
      return Object.assign({}, state, {
        config: action.config
      });
    case RECEIVE_SUBGROUPS:
      return Object.assign({}, state, {
        subgroups: action.subgroups
      });
    case DELETE_SUBGROUP:
      let subgroups = state.subgroups.filter(sg => sg !== action.subgroup);
      return Object.assign({}, state, {subgroups});
    case RECEIVE_USERS:
      return Object.assign({}, state, {users: action.users});
    case UPDATE_USERS:
      // Currently, api/addUser returns the user regardless, remove before adding to avoid dupes, this can be removed when API is refactored
      let newUsers = state.users.filter(u => u.regid !== action.user.regid);
      return Object.assign({}, state, {users: [...newUsers, action.user]});
    case REMOVE_USER:
      let users =  state.users.filter(u => u.netid !== action.user);
      return Object.assign({}, state, {users})
    default:
      return state;
  }
}