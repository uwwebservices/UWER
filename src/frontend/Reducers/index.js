import Const from '../Constants';
import defaultUser from 'Assets/defaultUser';

const initialState = {
  authenticated: null,
  auth: { UWNetID: "", DisplayName: "" },
  iaaauth: false,
  iaacheck: "",
  groupName: "",
  config: {},
  subgroups: [],
  users: [],
  registrationToken: "",
  development: process.env.NODE_ENV === "development",
  notifications: []
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
      let dummy = { displayId: action.displayId, Base64Image: defaultUser, loading: true };
      return Object.assign({}, state, { users: [dummy, ...state.users]});
    case Const.FAILED_DUMMY_USER:
      let noDummy = state.users.filter(u => u.displayId !== action.displayId);
      return Object.assign({}, state, { users: noDummy });
    case Const.UPDATE_USERS:
      let newUsers = state.users.map(u => {
        if(u.displayId && u.displayId === action.user.displayId) {
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
      return Object.assign({}, state, {authenticated: action.authenticated, iaaauth: action.iaaauth, iaacheck: action.iaacheck});
    case Const.STORE_REGISTRATION_TOKEN:
      return Object.assign({}, state, {registrationToken: action.token});
    case Const.RESET_STATE:
      return initialState;
    case Const.ADD_NOTIFICATION:
      return Object.assign({}, state, { notifications: [{ messageId: action.messageId, title: action.title, message: action.message}, ...state.notifications] });
    case Const.REMOVE_NOTIFICATION:
      let newNotifications = state.notifications.filter(n => n.messageId != action.messageId);
      return Object.assign({}, state, { notifications: newNotifications });
    default:
      return state;
  }
}