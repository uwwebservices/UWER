import { RECEIVE_GROUP_NAME, 
         REQUEST_CONFIG, 
         RECEIVE_CONFIG,
         REQUEST_SUBGROUPS, 
         RECEIVE_SUBGROUPS, 
         DELETE_SUBGROUP 
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
const LoadGroupName = group => {
  return dispatch => {
    let groupName = localStorage.getItem("groupName");
    groupName = groupName ? groupName : group;
    return dispatch(ReceiveGroupName(groupName));
  }
}
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

export const DestroySubgroup = subgroup => {
  return dispatch => {
    return fetch(`/api/groups/${subgroup}`, {
        method: "DELETE"
      }).then(() => {
        dispatch(DeleteSubgroup(subgroup));
      })
  }
}

