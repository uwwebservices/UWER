import Const from '../Constants';
import defaultUser from 'Assets/defaultUser';

export const initialState = {
  authenticated: null,
  iaaAuth: null,
  iaacheck: '',
  groupName: '',
  subgroups: [],
  users: [],
  loading: { users: false, subgroups: false },
  registrationToken: false,
  privGrpVisTimeout: 5,
  netidAllowed: false,
  tokenTTL: 180,
  confidential: false,
  notifications: []
};

export const RootReducer = (state = initialState, action) => {
  switch (action.type) {
    case Const.RECEIVE_GROUP_NAME:
      return { ...state, groupName: action.groupName };
    case Const.LOADING_SUBGROUPS:
      return { ...state, loading: { ...state.loading, subgroups: true } };
    case Const.RECEIVE_SUBGROUPS:
      return { ...state, subgroups: action.subgroups, loading: { ...state.loading, subgroups: false } };
    case Const.DELETE_SUBGROUP:
      let subgroups = state.subgroups.filter(sg => sg.id !== action.subgroup);
      return { ...state, subgroups };
    case Const.LOADING_USERS:
      return { ...state, loading: { ...state.loading, users: true } };
    case Const.RECEIVE_USERS:
    case Const.CLEAR_USERS:
      return { ...state, users: action.users, loading: { ...state.loading, users: false } };
    case Const.ADD_DUMMY_USER:
      return { ...state, users: [{ displayId: action.displayId, Base64Image: defaultUser, loading: true }, ...state.users] };
    case Const.FAILED_DUMMY_USER:
      return { ...state, users: state.users.filter(u => u.displayId !== action.displayId) };
    case Const.UPDATE_USERS:
      let newUsers = state.users.map(u => {
        return u.displayId && u.displayId === action.user.displayId ? action.user : u;
      });
      return { ...state, users: newUsers };
    case Const.MARK_USER_FOR_DELETION:
      let users = state.users.map(u => {
        if (u.UWNetID === action.identifier) {
          u.deleting = true;
        }
        return u;
      });
      return { ...state, users };
    case Const.REMOVE_USER:
      let userRemoved = state.users.filter(u => u.UWNetID !== action.user);
      return { ...state, users: userRemoved };
    case Const.USER_AUTHENTICATION:
      return { ...state, authenticated: action.authenticated, iaaAuth: action.iaaAuth, iaacheck: action.iaacheck };
    case Const.STORE_REGISTRATION_TOKEN:
      return { ...state, registrationToken: action.token };
    case Const.STORE_PRIVATE_GROUP_VISIBILITY_TIMEOUT:
      return { ...state, privGrpVisTimeout: action.timeout };
    case Const.STORE_NETID_ALLOWED:
      return { ...state, netidAllowed: action.netidAllowed };
    case Const.STORE_TOKEN_TTL:
      return { ...state, tokenTTL: action.tokenTTL };
    case Const.ADD_NOTIFICATION:
      return { ...state, notifications: [...state.notifications, action.notification] };
    case Const.REMOVE_NOTIFICATION:
      return { ...state, notifications: state.notifications.filter(n => n.messageId != action.messageId) };
    case Const.PRIVATE_GROUP:
      return { ...state, confidential: action.confidential };
    case Const.RESET_STATE:
      return initialState;
    case Const.STORE_SETTINGS:
      return { ...state, ...action.settings };
    default:
      return state;
  }
};
