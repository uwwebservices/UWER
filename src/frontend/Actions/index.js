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
const ReceiveUsers = users => { return { type: RECEIVE_USERS, users}};
const UpdateUsers = user => { return { type: UPDATE_USERS, user}};
const RemoveUser = user => { return { type: REMOVE_USER, user}};

// -----------------------
// Thunks - Async Actions

// Load config file from API into store
export const LoadConfig = () => {
  return async dispatch => {
    dispatch(await RequestConfig());
    let res = await fetch('/api/config');
    let json = await res.json();
    await dispatch(await ConfigLoaded(json));
    return await dispatch(await LoadGroupName(json.groupNameBase+json.groupNameLeaf));
  }
}

// Store groupname in localstorage and update store
export const UpdateGroupName = groupName => {
  return async dispatch => {
    localStorage.setItem("groupName", groupName);
    return await dispatch( await ReceiveGroupName(groupName));
  }
}

// load group name into store, generate default if null
export const LoadGroupName = group => {
  return async dispatch => {
    let groupName = localStorage.getItem("groupName");
    groupName = groupName ? groupName : group;
    return await dispatch(await ReceiveGroupName(groupName));
  }
}

// This needs to send groupName and utilize it in the backend
export const LoadSubgroups = groupName => {
  return async dispatch => {
    await dispatch(RequestSubgroups());
    let groupNameBase = store.getState().config.groupNameBase;
    let res = await fetch(`/api/groups/${groupNameBase}/subgroups`)
    let subgroups = await res.json();
    return await dispatch(await ReceiveSubgroups(subgroups));
  }
}

// This needs to send groupName and utilize it in the backend
export const DestroySubgroup = subgroup => {
  return async dispatch => {
    await fetch(`/api/groups/${subgroup}`, {
      method: "DELETE"
    })
    return await dispatch(await DeleteSubgroup(subgroup));
  }
}

// This needs to send groupName and utilize it in the backend
export const LoadUsers = () => {
  return async dispatch => {
    await dispatch(RequestUsers());
    let res = await fetch('/api/register?verbose=true')
    let users = (await res.json()).users;
    return await dispatch(await ReceiveUsers(users));
  }
}

// This needs to send groupName and utilize it in the backend
export const AddUser = user => {
  return async dispatch => {
    let res = await fetch('/api/register/' + user.regid + '?verbose=true', { method: 'PUT' });
    let user = await res.json();
    return await dispatch(UpdateUsers(user))
  }
}

// This needs to send groupName and utilize it in the backend
export const DeleteUser = user => {
  return async dispatch => {
    await fetch('/api/register/' + user, { method: 'DELETE' })
    return await dispatch(await RemoveUser(user));
  }
}

export const InitApp = () => {
  return async dispatch => {
    let state = store.getState();
    if(state.config) {
      await dispatch(LoadConfig());
    }
    if(!state.groupName) {
      await dispatch(LoadGroupName());
    }
    if(!state.users.length) {
      await dispatch(LoadUsers());
    }
    if(!state.subgroups.length) {
      await dispatch(LoadSubgroups());
    }
  }
}