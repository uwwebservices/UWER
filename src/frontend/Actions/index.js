import { RECEIVE_GROUP_NAME, 
         REQUEST_CONFIG, 
         RECEIVE_CONFIG,
         REQUEST_SUBGROUPS, 
         RECEIVE_SUBGROUPS, 
         DELETE_SUBGROUP,
         RECEIVE_USERS,
         REQUEST_USERS,
         UPDATE_USERS,
         REMOVE_USER
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

// -----------------------
// Thunks - Async Actions

// Load config file from API into store
export const LoadConfig = () => {
  return async dispatch => {
    dispatch(await RequestConfig());
    let res = await fetch('/api/config');
    let json = await res.json();
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
    let res = await fetch(`/api/subgroups/${group}?synchronized=true`, {method: "POST"});
  }
}

export const LoadSubgroups = groupName => {
  return async dispatch => {
    await dispatch(RequestSubgroups());
    let groupNameBase = store.getState().config.groupNameBase;
    let res = await fetch(`/api/subgroups/${groupNameBase}`);
    let subgroups = await res.json();
    return await dispatch(ReceiveSubgroups(subgroups));
  }
}

export const DestroySubgroup = group => {
  return async dispatch => {
    await fetch(`/api/subgroups/${group}`, { method: "DELETE" });
    return await dispatch(DeleteSubgroup(group));
  }
}

export const LoadUsers = group => {
  return async dispatch => {
    await dispatch(RequestUsers());
    let res = await fetch(`/api/members/${group}`);
    let users = await res.json();
    return await dispatch(ReceiveUsers(users));
  }
}

export const AddUser = (group, identifier) => {
  return async dispatch => {
    let res = await fetch(`/api/members/${group}/${identifier}`, { method: 'PUT' });
    let user = await res.json();
    return await dispatch(UpdateUsers(user))
  }
}

export const DeleteUser = (group, identifier) => {
  return async dispatch => {
    await fetch(`/api/members/${group}/member/${identifier}`, { method: 'DELETE' })
    return await dispatch(RemoveUser(identifier));
  }
}

export const InitApp = () => {
  return async dispatch => {
    let state = store.getState();
    state.config && await dispatch(LoadConfig());
    state.groupName && await dispatch(LoadGroupName());
    state = store.getState();
    !state.users.length && await dispatch(LoadUsers(state.groupName));
    !state.subgroups.length && await dispatch(LoadSubgroups(state.groupName));
  }
}

export const FetchToken = () => {
  return async dispatch => {
    let res = await fetch('/api/token');
    let token = await res.json();
    console.log("Token!", token);
  }
}