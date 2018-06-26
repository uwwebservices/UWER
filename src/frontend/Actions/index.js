import Const from '../Constants';
import store from '../Store';

// Action Creators
const ReceiveGroupName = groupName => { return {type: Const.RECEIVE_GROUP_NAME, groupName }};
const ConfigLoaded = config => { return { type: Const.RECEIVE_CONFIG, config }};
const ReceiveSubgroups = subgroups => { return { type: Const.RECEIVE_SUBGROUPS, subgroups }};
const DeleteSubgroup = subgroup => { return { type: Const.DELETE_SUBGROUP, subgroup }};
const ReceiveUsers = users => { return { type: Const.RECEIVE_USERS, users }};
const UpdateUsers = user => { return { type: Const.UPDATE_USERS, user }};
const RemoveUser = user => { return { type: Const.REMOVE_USER, user }};
const Authenticated = authenticated => { return {type: Const.USER_AUTHENTICATION, authenticated }};
const ReceiveAuth = auth => { return {type: Const.RECEIVE_AUTH, auth}};
const AddDummyUser = identifier => { return { type: Const.ADD_DUMMY_USER, identifier}};
const MarkUserForDeletion = identifier => { return { type: Const.MARK_USER_FOR_DELETION, identifier }};
const DummyUserFail = identifier => { return { type: Const.FAILED_DUMMY_USER, identifier }}

export const StoreRegistrationToken = token => { return { type: Const.STORE_REGISTRATION_TOKEN, token }};


// -----------------------
// Thunks - Async Actions

const APIRequestWithAuth = async (url, opts) => {
  let body = Object.assign({ method: "GET", credentials: "same-origin"}, opts);
  let res = await fetch(url, body);
  try {
    return await res.json();
  } catch(ex) {
    throw(ex);
  }
}

// Load config file from API into store
export const LoadConfig = () => {
  return async dispatch => {
    let json = await APIRequestWithAuth('/api/config');
    await dispatch(await ConfigLoaded(json));
    return await dispatch(LoadGroupName(json.groupNameBase+json.groupNameLeaf));
  }
}

// Store groupname in localstorage and update store
export const UpdateGroupName = groupName => {
  return async dispatch => {
    localStorage.setItem("groupName", groupName);
    return await dispatch(ReceiveGroupName(groupName));
  }
}

// load group name into store, generate default if null
export const LoadGroupName = group => {
  return async dispatch => {
    let groupName = localStorage.getItem("groupName");
    groupName = groupName ? groupName : group;
    return await dispatch(ReceiveGroupName(groupName));
  }
}

export const CreateGroup = group => {
  return async dispatch => {
    let res = await fetch(`/api/subgroups/${group}?synchronized=true`, {method: "POST", credentials: 'same-origin' });
  }
}

export const LoadSubgroups = groupName => {
  return async dispatch => {
    let groupNameBase = store.getState().config.groupNameBase;
    let subgroups = await APIRequestWithAuth(`/api/subgroups/${groupNameBase}`);
    return await dispatch(ReceiveSubgroups(subgroups));
  }
}

export const DestroySubgroup = group => {
  return async dispatch => {
    await APIRequestWithAuth(`/api/subgroups/${group}`, { method: "DELETE" });
    return await dispatch(DeleteSubgroup(group));
  }
}

export const LoadUsers = group => {
  return async dispatch => {
    let users = await APIRequestWithAuth(`/api/members/${group}`);
    return await dispatch(ReceiveUsers(users));
  }
}

export const AddUser = (group, identifier) => {
  return async dispatch => {
    dispatch(AddDummyUser(identifier));
    let state = store.getState();
    try {
      let user = await APIRequestWithAuth(`/api/members/${group}/${identifier}`, { 
        method: 'PUT', 
        body: JSON.stringify({token: state.registrationToken}),
        headers:{
          'Content-Type': 'application/json'
        }
      });
      return dispatch(UpdateUsers(user));
    } catch (ex) {
      dispatch(DummyUserFail(identifier));
    }
  }
}

export const DeleteUser = (group, identifier) => {
  return async dispatch => {
    dispatch(MarkUserForDeletion(identifier));
    await APIRequestWithAuth(`/api/members/${group}/member/${identifier}`, { method: "DELETE" });
    return await dispatch(RemoveUser(identifier));
  }
}

export const CheckAuthentication = () => {
  return async dispatch => {
    try {
      let res = await fetch('/api/checkAuth', { credentials: "same-origin" });
      let user = (await res.json()).auth;
      let auth = res.status === 200;
      dispatch(Authenticated(auth));
      dispatch(ReceiveAuth(user));
    } catch(ex) {
      dispatch(Authenticated(false));
      dispatch(ReceiveAuth({ UWNetID: "", DisplayName: "" }));
    }
  }
}

export const InitApp = () => {
  return async dispatch => {
    await dispatch(CheckAuthentication());
    let state = store.getState();
    state.config && await dispatch(LoadConfig());
    !state.groupName && await dispatch(LoadGroupName());
    state = store.getState();
    !state.users.length && state.groupName && await dispatch(LoadUsers(state.groupName));
    !state.subgroups.length && state.groupName && state.authenticated && await dispatch(LoadSubgroups(state.groupName));
  }
}