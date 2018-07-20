import Const from '../Constants';
import store from '../Store';
import Cookies from 'browser-cookies';

// Action Creators
const ReceiveGroupName = groupName => { return {type: Const.RECEIVE_GROUP_NAME, groupName }};
const ConfigLoaded = config => { return { type: Const.RECEIVE_CONFIG, config }};
const ReceiveSubgroups = subgroups => { return { type: Const.RECEIVE_SUBGROUPS, subgroups }};
const DeleteSubgroup = subgroup => { return { type: Const.DELETE_SUBGROUP, subgroup }};
const ReceiveUsers = users => { return { type: Const.RECEIVE_USERS, users }};
const UpdateUsers = user => { return { type: Const.UPDATE_USERS, user }};
const RemoveUser = user => { return { type: Const.REMOVE_USER, user }};
const Authenticated = authenticated => { return {type: Const.USER_AUTHENTICATION, authenticated }};
const AddDummyUser = identifier => { return { type: Const.ADD_DUMMY_USER, identifier}};
const MarkUserForDeletion = identifier => { return { type: Const.MARK_USER_FOR_DELETION, identifier }};
const DummyUserFail = identifier => { return { type: Const.FAILED_DUMMY_USER, identifier }};
const ResetState = () => { return { type: Const.RESET_STATE }};
const AddNotification = (messageId, title, message) => { return { type: Const.ADD_NOTIFICATION, messageId, title, message }};
const RemoveNotification = messageId => { return { type: Const.REMOVE_NOTIFICATION, messageId }};

export const StoreRegistrationToken = token => { return { type: Const.STORE_REGISTRATION_TOKEN, token }};


// -----------------------
// Thunks - Async Actions

const APIRequestWithAuth = async (url, opts) => {
  let body = Object.assign({ method: "GET", credentials: "same-origin"}, opts);
  return await fetch(url, body);
}

// Load config file from API into store
export const LoadConfig = () => {
  return async dispatch => {
    let json = await (await APIRequestWithAuth('api/config')).json();
    return await dispatch(await ConfigLoaded(json));
  }
}

export const UpdateGroupName = groupName => {
  return async dispatch => {
    if(Cookies.get("groupName")) {
      Cookies.erase("groupName");
    }
    Cookies.set("groupName", groupName, { expires: 1/24 });
    return await dispatch(ReceiveGroupName(groupName));
  }
}

export const CreateGroup = group => {
  return async dispatch => {
    await APIRequestWithAuth(`api/subgroups/${group}`, { method: "POST"});
  }
}

export const LoadSubgroups = () => {
  return async dispatch => {
    let groupNameBase = store.getState().config.groupNameBase;
    let subgroups = await (await APIRequestWithAuth(`api/subgroups/${groupNameBase}`)).json();
    return await dispatch(ReceiveSubgroups(subgroups));
  }
}

export const DestroySubgroup = group => {
  return async dispatch => {
    await APIRequestWithAuth(`api/subgroups/${group}`, { method: "DELETE" });
    return await dispatch(DeleteSubgroup(group));
  }
}

export const LoadUsers = group => {
  return async dispatch => {
    let users = await (await APIRequestWithAuth(`api/members/${group}`)).json();
    return await dispatch(ReceiveUsers(users));
  }
}

export const AddUser = (group, identifier) => {
  return async dispatch => {
    dispatch(AddDummyUser(identifier));
    let state = store.getState();
    try {
      let res = await APIRequestWithAuth(`api/members/${group}/${identifier}`, { 
        method: 'PUT', 
        body: JSON.stringify({token: state.registrationToken || Cookies.get("registrationToken")}),
        headers:{
          'Content-Type': 'application/json'
        }
      });
      if(res.status === 404) {
        dispatch(FlashNotification("User not found", "Could not find the specified user."));
        return dispatch(DummyUserFail(identifier));
      } 
      let user = await res.json();
      // GWS considers adding the same user to a group an update and returns a 200, so we have to handle the dupes..
      let dupe = state.users.find(u => {
        return u.UWRegID === user.UWRegID;
      });
      console.log("DUPE", dupe)
      if(dupe) {
        dispatch(FlashNotification("Duplicate User", `${user.UWNetID || "This user"} has already been added to this group.`));
        dispatch(DummyUserFail(identifier));
      } else {
        dispatch(UpdateUsers(user));
      }
    } catch (ex) {
      dispatch(DummyUserFail(identifier));
    }
  }
}

export const DeleteUser = (group, identifier) => {
  return async dispatch => {
    dispatch(MarkUserForDeletion(identifier));
    await APIRequestWithAuth(`api/members/${group}/member/${identifier}`, { method: "DELETE" });
    return dispatch(RemoveUser(identifier));
  }
}

export const CheckAuthentication = () => {
  return async dispatch => {
    try {
      let res = await fetch('api/checkAuth', { credentials: "same-origin" });
      dispatch(Authenticated(res.status === 200));
    } catch(ex) {
      dispatch(Authenticated(false));
    }
  }
}

export const Logout = () => {
  return async dispatch => {
    await fetch('api/logout', { credentials: "same-origin" });
    dispatch(Authenticated(false));
  }
}

export const StartRegistrationSession = () => {
  return async dispatch => {
    let token = (await (await APIRequestWithAuth('api/getToken')).json()).token;
    dispatch(StoreRegistrationToken(token));
    Cookies.set("registrationToken", token, { expires: 1/24 });
    dispatch(Logout());
  }
}

export const StopRegistrationSession = () => {
  return async dispatch => {
    Cookies.erase("registrationToken", { path: "/"});
    Cookies.erase("groupName", { path: "/"});
    dispatch(Logout());
    dispatch(ResetState());
  }
}

export const InitApp = () => {
  return async dispatch => {
    let state = store.getState();
    if(!state.authenticated && !state.development) {
      await dispatch(CheckAuthentication());
    }
    
    !Object.keys(state.config).length && await dispatch(LoadConfig());
    state = store.getState();

    if(!state.groupName) {
      let groupName = Cookies.get('groupName');
      if(groupName) {
        dispatch(UpdateGroupName(groupName));
      }
    }

    if(!state.token) {
      let registrationToken = Cookies.get('registrationToken');
      if(registrationToken) {
        dispatch(StoreRegistrationToken(registrationToken));
      }
    }

    state = store.getState();

    !state.users.length && state.groupName && dispatch(LoadUsers(state.groupName));
    !state.subgroups.length && (state.authenticated || state.development) && dispatch(LoadSubgroups());
  }
}

export const FlashNotification = (title = "", message = "") => {
  return async dispatch => {
    let messageId = Math.floor(Math.random() * 10000).toString();
    dispatch(AddNotification(messageId, title, message));
    dispatch(RemoveNotification(messageId));
  }
}