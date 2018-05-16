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
const ReceiveGroupName = groupName => {
  return {
    type: RECEIVE_GROUP_NAME,
    groupName
  }
}
const RequestConfig = () => {
  return {
    type: REQUEST_CONFIG
  }
}
const ConfigLoaded = config => {
  return {
    type: RECEIVE_CONFIG,
    config
  }
}
const RequestSubgroups = () => {
  return {
    type: REQUEST_SUBGROUPS,
  }
}
const ReceiveSubgroups = subgroups => {
  return {
    type: RECEIVE_SUBGROUPS,
    subgroups
  }
}
const DeleteSubgroup = subgroup => {
  return {
    type: DELETE_SUBGROUP,
    subgroup
  }
}
const RequestUsers = () => {
  return {
    type: REQUEST_USERS,
  }
}
const ReceiveUsers = users => {
  return {
    type: RECEIVE_USERS,
    users
  }
}
const UpdateUsers = user => {
  return {
    type: UPDATE_USERS,
    user
  }
}
const RemoveUser = user => {
  return {
    type: REMOVE_USER,
    user
  }
}
//ActionCreator Template
// const ActionCreatorName = (data) => {
//   return {
//     type: SOME_CONSTANT,
//     data: data
//   }
// }

// Thunks - Async Actions

// Load config file from API into store
export const LoadConfig = () => {
  return async dispatch => {
    dispatch(await RequestConfig());
    let res = await fetch('/api/config');
    let json = await res.json();
    dispatch(await ConfigLoaded(json));
    dispatch(await LoadGroupName(json.groupNameBase+json.groupNameLeaf));
  }
}

// Store groupname in localstorage and update store
export const UpdateGroupName = (groupName) => {
  return dispatch => {
    localStorage.setItem("groupName", groupName);
    dispatch(ReceiveGroupName(groupName));
  }
}

// load group name into store, generate default if null
export const LoadGroupName = group => {
  return dispatch => {
    let groupName = localStorage.getItem("groupName");
    groupName = groupName ? groupName : group;
    return dispatch(ReceiveGroupName(groupName));
  }
}

// This needs to send groupName and utilize it in the backend
export const LoadSubgroups = groupName => {
  return dispatch => {
    dispatch(RequestSubgroups());
    let groupNameBase = store.getState().config.groupNameBase;
    return fetch(`/api/groups/${groupNameBase}/subgroups`)
      .then(res => res.json())
      .then(subgroups => {
          return dispatch(ReceiveSubgroups(subgroups));
      });
  }
}

// This needs to send groupName and utilize it in the backend
export const DestroySubgroup = subgroup => {
  return dispatch => {
    return fetch(`/api/groups/${subgroup}`, {
        method: "DELETE"
      }).then(() => {
        dispatch(DeleteSubgroup(subgroup));
      })
  }
}

// This needs to send groupName and utilize it in the backend
export const LoadUsers = () => {
  return dispatch => {
    dispatch(RequestUsers());
    fetch('/api/register?verbose=true')
      .then(res => res.json())
      .then(json => {
        dispatch(ReceiveUsers(json.users));
      });
  }
}

// This needs to send groupName and utilize it in the backend
export const AddUser = user => {
  return dispatch => {
    fetch('/api/register/' + user.regid + '?verbose=true', {
      method: 'PUT'
    })
    .then(res => res.json())
    .then(json => {
      dispatch(UpdateUsers(json));
    })
  }
}

// This needs to send groupName and utilize it in the backend
export const DeleteUser = user => {
  return dispatch => {
    fetch('/api/register/' + user, {
      method: 'DELETE'
    }).then(() => {
      dispatch(RemoveUser(user));
    })
  }
}

export const InitApp = () => {
  return async dispatch => {
    let state = store.getState();
    console.log(state);

    if(state.config) {
      console.log("loading Config...")
      await dispatch(LoadConfig());
      console.log("config loaded")
    }

    if(!state.groupName) {
      console.log("loading group name...")
      await dispatch(LoadGroupName());
      console.log("group name loaded")
    }

    if(!state.users.length) {
      console.log("loading users...")
      await dispatch(LoadUsers());
      console.log("users loaded...")
    }
    if(!state.subgroups.length) {
      console.log("loading subgroups");
      await dispatch(LoadSubgroups());
      console.log("subgroups loaded")
    }
  }
}