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
const Authenticated = (authenticated, iaaAuth, iaacheck) => { return {type: Const.USER_AUTHENTICATION, authenticated, iaaAuth, iaacheck}};
const AddDummyUser = displayId => { return { type: Const.ADD_DUMMY_USER, displayId}};
const MarkUserForDeletion = identifier => { return { type: Const.MARK_USER_FOR_DELETION, identifier }};
const DummyUserFail = displayId => { return { type: Const.FAILED_DUMMY_USER, displayId }};
const ResetState = () => { return { type: Const.RESET_STATE }};
const AddNotification = (messageId, title, message) => { return { type: Const.ADD_NOTIFICATION, messageId, title, message }};
const RemoveNotification = messageId => { return { type: Const.REMOVE_NOTIFICATION, messageId }};
const PrivateGroup = confidential => { return { type: Const.PRIVATE_GROUP, confidential }};

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
    let json = await (await APIRequestWithAuth('/api/config')).json();
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

export const CreateGroup = (group, confidential=true, description, email) => {
  return async dispatch => {
    let res = await APIRequestWithAuth(`/api/subgroups/${group}?confidential=${confidential}&description=${description}&email=${email}`, { method: "POST"});
    return res.status === 200;
  }
}

export const LoadSubgroups = () => {
  return async dispatch => {
    let groupNameBase = store.getState().groupNameBase;
    let subgroups = await (await APIRequestWithAuth(`/api/subgroups/${groupNameBase}`)).json();
    return await dispatch(ReceiveSubgroups(subgroups));
  }
}

export const DestroySubgroup = group => {
  return async dispatch => {
    await APIRequestWithAuth(`/api/subgroups/${group}`, { method: "DELETE" });
    Cookies.erase("groupName", { path: "/"});
    return await dispatch(DeleteSubgroup(group));
  }
}

export const LoadUsers = group => {
  return async dispatch => {
    let state = store.getState();
    let token = state.registrationToken || Cookies.get("registrationToken");
    
    let groupInfo = await (await APIRequestWithAuth(`/api/members/${group}${token ? "?token="+token : "" }`)).json();
    dispatch(PrivateGroup(groupInfo.confidential));
    return await dispatch(ReceiveUsers(groupInfo.members));
  }
}

export const AddUser = (group, identifier) => {
  return async dispatch => {
    let state = store.getState();
    let displayId = Math.floor(Math.random()*1000000).toString(16);
    let token = state.registrationToken || Cookies.get("registrationToken");

    dispatch(AddDummyUser(displayId));
    let body = {
      token,
      displayId,
      identifier
    };
    try {
      let res = await APIRequestWithAuth(`/api/members/${group}`, { 
        method: 'PUT', 
        body: JSON.stringify(body),
        headers:{
          'Content-Type': 'application/json'
        }
      });
      if(res.status === 201) {
        dispatch(FlashNotification("Successfully Added User", "Group Membership is Private"))
      }
      if(res.status === 404) {
        dispatch(FlashNotification("User not found", "Could not find the specified user."));
        return dispatch(DummyUserFail(displayId));
      } 
      if(res.status === 401) {
        if(token) {
          dispatch(FlashNotification("Session Ended", "Your registration session has ended, please start a new session."));
          return dispatch(DummyUserFail(displayId));
        } else {
          dispatch(FlashNotification("Not Authorized", "You are not authorized to register users or your registration session has ended."))
        }
        
      }
      let user = await res.json();
      // GWS considers adding the same user to a group an update and returns a 200, so we have to handle the dupes..
      let dupe = state.users.find(u => {
        return u.UWRegID === user.UWRegID;
      });
      if(dupe) {
        dispatch(FlashNotification("Duplicate User", `${user.UWNetID || "This user"} has already been added to this group.`));
        dispatch(DummyUserFail(displayId));
      } else {
        dispatch(UpdateUsers(user));
      }
    } catch (ex) {
      dispatch(DummyUserFail(displayId));
    }

  }
}

export const DeleteUser = (group, identifier) => {
  return async dispatch => {
    dispatch(MarkUserForDeletion(identifier));
    await APIRequestWithAuth(`/api/members/${group}/member/${identifier}`, { method: "DELETE" });
    return dispatch(RemoveUser(identifier));
  }
}

export const CheckAuthentication = () => {
  return async dispatch => {
    try {
      let json = await (await APIRequestWithAuth('/api/checkAuth')).json();
      console.log("Auth json", json);
      dispatch(Authenticated(json.Authenticated, json.IAAAAuth, json.IAARedirect));
    } catch(ex) {
      dispatch(Authenticated(false, false));
    }
  }
}

export const Logout = () => {
  return async dispatch => {
    await APIRequestWithAuth('/api/logout');
    dispatch(Authenticated(false, false));
  }
}

export const StartRegistrationSession = (groupName, netidAllowed=false, tokenTTL=180) => {
  return async dispatch => {
    let token = (await (await APIRequestWithAuth(`/api/getToken?groupName=${groupName}&netidAllowed=${netidAllowed}&tokenTTL=${tokenTTL}`)).json()).token;
    dispatch(StoreRegistrationToken(token));
    dispatch(ReceiveUsers([]));
    resetTokenCookie(token, tokenTTL);
    await dispatch(Logout());
    dispatch(LoadUsers(groupName));
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
    
    !Object.keys(state.groupNameBase).length && await dispatch(LoadConfig());
    state = store.getState();

    if(!state.groupName) {
      let groupName = Cookies.get('groupName');
      if(groupName) {
        dispatch(UpdateGroupName(groupName));
      }
    }

    if(!state.token) {
      let registrationToken = Cookies.get('registrationToken');
      registrationToken && dispatch(StoreRegistrationToken(registrationToken));
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

const resetTokenCookie = (token, expires) => {
  expires = expires / 60 / 24;
  if(token) {
    if(Cookies.get("registrationToken", { path: "/"})) {
      Cookies.erase("registrationToken", { path: "/"});
    }
    Cookies.set("registrationToken", token, { expires });
  }
}