import { RECEIVE_GROUP_NAME, 
         REQUEST_CONFIG, 
         RECEIVE_CONFIG,
         REQUEST_SUBGROUPS, 
         RECEIVE_SUBGROUPS, 
         DELETE_SUBGROUP,
         RECEIVE_USERS,
         REQUEST_USERS,
         UPDATE_USERS,
         REMOVE_USER,
         USER_AUTHENTICATION,
         RECEIVE_AUTH
        } from '../Constants';
import store from '../Store';


// Action Creators
const ReceiveGroupName = groupName => { return {type: RECEIVE_GROUP_NAME, groupName }};
const RequestConfig = () => { return { type: REQUEST_CONFIG }};
const ConfigLoaded = config => { return { type: RECEIVE_CONFIG, config }};
const RequestSubgroups = () => { return { type: REQUEST_SUBGROUPS }};
const ReceiveSubgroups = subgroups => { return { type: RECEIVE_SUBGROUPS, subgroups }};
const DeleteSubgroup = subgroup => { return { type: DELETE_SUBGROUP, subgroup }};
const RequestUsers = () => { return { type: REQUEST_USERS }};
const ReceiveUsers = users => { return { type: RECEIVE_USERS, users }};
const UpdateUsers = user => { return { type: UPDATE_USERS, user }};
const RemoveUser = user => { return { type: REMOVE_USER, user }};
const Authenticated = authenticated => { return {type: USER_AUTHENTICATION, authenticated }};
const ReceiveAuth = auth => { return {type: RECEIVE_AUTH, auth}};

// -----------------------
// Thunks - Async Actions

const APIRequestWithAuth = async (url, opts) => {
  let body = Object.assign({ method: "GET", credentials: "same-origin"}, opts);
  let res = await fetch(url, body);
  try {
    return await res.json();
  } catch(ex) {
    return {};
  }
}

// Load config file from API into store
export const LoadConfig = () => {
  return async dispatch => {
    dispatch(await RequestConfig());
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
    await dispatch(RequestSubgroups());
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
    await dispatch(RequestUsers());
    let users = await APIRequestWithAuth(`/api/members/${group}`);
    return await dispatch(ReceiveUsers(users));
  }
}

export const AddUser = (group, identifier) => {
  return async dispatch => {
    let user = await APIRequestWithAuth(`/api/members/${group}/${identifier}`,  { method: 'PUT' });
    return await dispatch(UpdateUsers(user));
  }
}

export const DeleteUser = (group, identifier) => {
  return async dispatch => {
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
    !state.subgroups.length && state.groupName && await dispatch(LoadSubgroups(state.groupName));
  }
}