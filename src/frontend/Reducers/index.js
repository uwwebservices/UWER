import Const from '../Constants';
import defaultUser from 'Assets/defaultUser';

const initialState = {
  authenticated: null,
  auth: { UWNetID: "", DisplayName: "" },
  groupName: "",
  config: {},
  subgroups: [],
  users: [],
  registrationToken: "",
  developmentMode: process.env.NODE_ENV === "develpoment"
};

export default (state = initialState, action) => {
  switch (action.type) {
    case Const.RECEIVE_GROUP_NAME:
      return Object.assign({}, state, { groupName: action.groupName });
    case Const.RECEIVE_CONFIG:
      return Object.assign({}, state, { config: action.config });
    case Const.RECEIVE_SUBGROUPS:
      return Object.assign({}, state, { subgroups: action.subgroups });
    case Const.DELETE_SUBGROUP:
      let subgroups = state.subgroups.filter(sg => sg.id !== action.subgroup);
      return Object.assign({}, state, {subgroups});
    case Const.RECEIVE_USERS:
      return Object.assign({}, state, {users: action.users});
    case Const.ADD_DUMMY_USER:
      let dummy = { identifier: action.identifier, Base64Image: defaultUser, loading: true };
      return Object.assign({}, state, { users: [dummy, ...state.users]});
    case Const.FAILED_DUMMY_USER:
      let noDummy = state.users.filter(u => u.identifier !== action.identifier);
      return Object.assign({}, state, { users: noDummy });
    case Const.UPDATE_USERS:
      let newUsers = state.users.map(u => {
        if(u.identifier && u.identifier === action.user.identifier) {
          delete action.user.identifier;
          return action.user;
        } else {
          return u;
        }
      });
      return Object.assign({}, state, {users: newUsers});
    case Const.MARK_USER_FOR_DELETION:
      let userMarked = state.users.map(u => {
        if(u.UWNetID === action.identifier) {
          u.deleting = true;
        }
        return u;
      });
      return Object.assign({}, state, {users: userMarked});
    case Const.REMOVE_USER:
      let userRemoved = state.users.filter(u => u.UWNetID !== action.user);
      return Object.assign({}, state, {users: userRemoved});
    case Const.USER_AUTHENTICATION:
      return Object.assign({}, state, {authenticated: action.authenticated});
    case Const.RECEIVE_AUTH:
      return Object.assign({}, state, {auth: action.auth});
    case Const.STORE_REGISTRATION_TOKEN:
      return Object.assign({}, state, {registrationToken: action.token});
    case Const.RESET_STATE:
      return initialState;
    default:
      return state;
  }
}