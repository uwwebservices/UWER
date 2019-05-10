// Prefixed with /api/
export const API = {
  GetMembers: '/members/:group',
  RegisterMember: '/members/:group',
  GetMemberPhoto: '/members/:group/photo/:identifier',
  RemoveMember: '/members/:group/member/:identifier',
  GetSubgroups: '/subgroups/:group', // @TODO: Remove :group after frontend refactor to not rely on API.GetConfig
  RemoveSubgroup: '/subgroups/:group',
  CreateGroup: '/subgroups/:group',
  CheckAuth: '/checkAuth',
  CSV: '/csv/:group.csv',
  GetToken: '/getToken',
  Logout: '/logout'
};

// Page Routes
export const Routes = {
  Welcome: '/',
  Register: '/register',
  Login: '/login',
  NotAuthorized: '/notAuthorized'
};
