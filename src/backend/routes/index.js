// Prefixed with /api/
export const API = {
  GetMembers: '/members/:group',
  RegisterMember: '/members/:group',
  GetMemberPhoto: '/members/:group/photo/:identifier',
  RemoveMember: '/members/:group/member/:identifier',
  GetSubgroups: '/subgroups/:group',
  RemoveSubgroup: '/subgroups/:group',
  CreateGroup: '/subgroups/:group',
  CheckAuth: '/checkAuth',
  Config: '/config',
  CSV: '/csv/:group.csv',
  GetToken: '/getToken',
  Logout: '/logout',
  Wai: '/wai'
};

// Page Routes
export const Routes = {
  Welcome: '/',
  Register: '/register',
  Login: '/login',
  NotAuthorized: '/notAuthorized'
};
