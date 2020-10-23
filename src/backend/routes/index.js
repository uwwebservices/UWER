// Prefixed with /api/
export const API = {
  GetMembers: '/members/:group',
  RegisterMember: '/members/:group',
  GetMemberPhoto: '/members/:group/photo/:identifier',
  RemoveMember: '/members/:group/member/:identifier',
  GetSubgroups: '/subgroups',
  RemoveSubgroup: '/subgroups/:group',
  CreateGroup: '/subgroups/:group',
  CheckAuth: '/checkAuth',
  CheckToken: '/checkToken',
  CSV: '/csv/:group.csv',
  GetToken: '/getToken',
  Logout: '/logout'
};

// Page Routes
export const Routes = {
  Welcome: '/',
  Config: '/config',
  Register: '/register',
  Login: '/login',
  NotAuthorized: '/notAuthorized'
};
