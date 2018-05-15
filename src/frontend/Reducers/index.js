import { RECEIVE_GROUP_NAME, RECEIVE_CONFIG, RECEIVE_SUBGROUPS, DELETE_SUBGROUP } from '../Constants';

const initialState = {
  groupName: "",
  config: {},
  subgroups: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_GROUP_NAME:
      return Object.assign({}, state, {
        groupName: action.groupName
      });
    case RECEIVE_CONFIG:
      return Object.assign({}, state, {
        config: action.config
      });
    case RECEIVE_SUBGROUPS:
      return Object.assign({}, state, {
        subgroups: action.subgroups
      });
    case DELETE_SUBGROUP:
      let subgroups = state.subgroups.filter(sg => sg !== action.subgroup);
      return Object.assign({}, state, {subgroups: subgroups});
    default:
      return state;
  }
}