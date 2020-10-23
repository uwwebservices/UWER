import Const from '../Constants';

// Action Creators
const ReceiveSubgroups = subgroups => {
  return { type: Const.RECEIVE_SUBGROUPS, subgroups };
};
const DeleteSubgroup = subgroup => {
  return { type: Const.DELETE_SUBGROUP, subgroup };
};
const LoadingUsers = () => {
  return { type: Const.LOADING_USERS };
};
const LoadingSubgroups = () => {
  return { type: Const.LOADING_SUBGROUPS };
};
const ReceiveUsers = users => {
  return { type: Const.RECEIVE_USERS, users };
};
export const ClearUsers = () => {
  return { type: Const.CLEAR_USERS, users: [] };
};
const UpdateUsers = user => {
  return { type: Const.UPDATE_USERS, user };
};
const RemoveUser = user => {
  return { type: Const.REMOVE_USER, user };
};
const Authenticated = (authenticated, iaaAuth, iaacheck) => {
  return { type: Const.USER_AUTHENTICATION, authenticated, iaaAuth, iaacheck };
};
const AddDummyUser = displayId => {
  return { type: Const.ADD_DUMMY_USER, displayId };
};
const MarkUserForDeletion = identifier => {
  return { type: Const.MARK_USER_FOR_DELETION, identifier };
};
const DummyUserFail = displayId => {
  return { type: Const.FAILED_DUMMY_USER, displayId };
};
export const ResetState = () => {
  return { type: Const.RESET_STATE };
};
const AddNotification = (messageId, title, message) => {
  return { type: Const.ADD_NOTIFICATION, notification: { messageId, title, message } };
};
const RemoveNotification = messageId => {
  return { type: Const.REMOVE_NOTIFICATION, messageId };
};
const PrivateGroup = confidential => {
  return { type: Const.PRIVATE_GROUP, confidential };
};
const StoreRegistrationToken = token => {
  return { type: Const.STORE_REGISTRATION_TOKEN, token };
};
export const UpdateGroupName = groupName => {
  return { type: Const.RECEIVE_GROUP_NAME, groupName };
};
export const UpdatePrivateGroupVis = enabled => {
  return { type: Const.STORE_PRIVATE_GROUP_VISIBILITY, enabled };
};
export const UpdatePrivateGroupVisTimeout = timeout => {
  return { type: Const.STORE_PRIVATE_GROUP_VISIBILITY_TIMEOUT, timeout };
};
export const UpdateNetidAllowed = netidAllowed => {
  return { type: Const.STORE_NETID_ALLOWED, netidAllowed };
};
export const UpdateTokenTTL = tokenTTL => {
  return { type: Const.STORE_TOKEN_TTL, tokenTTL };
};

// -----------------------
// Thunks - Async Actions

const APIRequestWithAuth = async (url, opts) => {
  let body = Object.assign({ method: 'GET', credentials: 'same-origin' }, opts);
  return await fetch(url, body);
};

export const CreateGroup = (group, confidential = true, description, email) => {
  return async dispatch => {
    let body = {
      confidential,
      description,
      email
    };
    let res = await APIRequestWithAuth(`/api/subgroups/${group}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return res.status === 200;
  };
};

export const LoadSubgroups = () => {
  return async (dispatch, getState) => {
    let state = getState();
    if (!state.loading.subgroups) {
      dispatch(LoadingSubgroups());
      let subgroups = await (await APIRequestWithAuth(`/api/subgroups`)).json();
      return await dispatch(ReceiveSubgroups(subgroups));
    }
  };
};

export const DestroySubgroup = group => {
  return async dispatch => {
    await APIRequestWithAuth(`/api/subgroups/${group}`, { method: 'DELETE' });
    dispatch(UpdateGroupName(''));
    return await dispatch(DeleteSubgroup(group));
  };
};

export const LoadUsers = () => {
  return async (dispatch, getState) => {
    let state = getState();
    let group = state.groupName;
    if (group) {
      dispatch(ClearUsers());
      dispatch(LoadingUsers());
      let groupInfo = await (await APIRequestWithAuth(`/api/members/${group}`)).json();
      dispatch(PrivateGroup(groupInfo.confidential));

      dispatch(CheckToken());

      state = getState();
      // only receive the users for the selected group
      // if a user switches groups a bunch, we can't cancel the API calls
      // so we throw away the results
      if (group === state.groupName) {
        return await dispatch(ReceiveUsers(groupInfo.members));
      }
    }
  };
};

export const AddUser = (group, identifier) => {
  return async (dispatch, getState) => {
    let state = getState();
    let displayId = Math.floor(Math.random() * 1000000).toString(16);

    dispatch(AddDummyUser(displayId));
    let body = {
      displayId,
      identifier
    };
    try {
      let res = await APIRequestWithAuth(`/api/members/${group}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      dispatch(CheckToken());

      if (res.status === 404) {
        dispatch(FlashNotification('User not found', 'Could not find the specified user.'));
        return dispatch(DummyUserFail(displayId));
      }
      if (res.status === 401) {
        if (state.registrationToken) {
          dispatch(FlashNotification('Session Ended', 'Your registration session has ended, please start a new session.'));
          return dispatch(DummyUserFail(displayId));
        } else {
          dispatch(FlashNotification('Not Authorized', 'You are not authorized to register users or your registration session has ended.'));
        }
      }
      let user = await res.json();
      // GWS considers adding the same user to a group an update and returns a 200, so we have to handle the dupes..
      let dupe = state.users.find(u => {
        return u.UWRegID === user.UWRegID;
      });
      if (dupe) {
        dispatch(FlashNotification('Duplicate User', `${user.UWNetID || 'This user'} has already been added to this group.`));
        dispatch(DummyUserFail(displayId));
      } else {
        // Return early if a private group w/o visibility
        if (state.confidential && !state.privGrpVis) {
          await dispatch(DummyUserFail(displayId));
          return;
        }

        // Show the user
        await dispatch(UpdateUsers(user));

        // Fade out the user if the group is confidential w/visibility
        if (state.confidential && state.privGrpVis) {
          const fadeOutDelay = 5000; // This should match scss `.fadeOutRemoval` transition
          const visibleDelay = state.privGrpVisTimeout * 1000;
          window.setTimeout(async () => {
            await dispatch(MarkUserForDeletion(identifier));
            window.setTimeout(async () => {
              await dispatch(RemoveUser(user.UWNetID));
            }, fadeOutDelay);
          }, visibleDelay);
        }
      }
    } catch (ex) {
      dispatch(DummyUserFail(displayId));
    }
  };
};

export const DeleteUser = (group, identifier) => {
  return async dispatch => {
    dispatch(MarkUserForDeletion(identifier));
    await APIRequestWithAuth(`/api/members/${group}/member/${identifier}`, { method: 'DELETE' });
    return dispatch(RemoveUser(identifier));
  };
};

export const CheckAuthentication = () => {
  return async dispatch => {
    try {
      let json = await (await APIRequestWithAuth('/api/checkAuth')).json();
      dispatch(Authenticated(json.Authenticated, json.IAAAAuth, json.IAARedirect));
    } catch (ex) {
      dispatch(Authenticated(false, false));
    }
  };
};

// Checks for registration token authentication
// Sets registrationToken bool in redux state based on response
export const CheckToken = () => {
  return async (dispatch) => {
    let res = await fetch('/api/checkToken', {
      method: 'GET',
      credentials: 'same-origin'
    });

    dispatch(StoreRegistrationToken(res.status === 200));
  };
};

export const Logout = (loggedOut = false) => {
  return async dispatch => {
    await APIRequestWithAuth('/api/logout' + (loggedOut ? `?loggedOut=${loggedOut}` : ''));
    dispatch(Authenticated(false, false));
  };
};

export const StartRegistrationSession = (groupName, netidAllowed = false, tokenTTL = 180, privGrpVis = true) => {
  return async dispatch => {
    await APIRequestWithAuth(`/api/getToken?groupName=${groupName}&netidAllowed=${netidAllowed}&tokenTTL=${tokenTTL}&privGrpVis=${privGrpVis}`);
    dispatch(StoreRegistrationToken(true));
    dispatch(ClearUsers());
    await dispatch(Logout(true));
  };
};

export const StopRegistrationSession = () => {
  return async dispatch => {
    dispatch(Logout());
    dispatch(ResetState());
  };
};

// spec compliant uuid v4: https://gist.github.com/jed/982883#file-index-js
const uuid = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)};

export const FlashNotification = (title = '', message = '') => {
  return async dispatch => {
    let messageId = uuid();
    dispatch(AddNotification(messageId, title, message));
    dispatch(RemoveNotification(messageId));
  };
};
