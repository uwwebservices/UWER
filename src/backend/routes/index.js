export const API = {
    "GetMembers": "/members/:group",
	"RegisterMember": "/members/:group/:identifier",
	"RemoveMember": "/members/:group/member/:identifier",
	"GetSubgroups": "/subgroups/:group",
	"RemoveSubgroup": "/subgroups/:group",
	"CreateGroup": "/subgroups/:group",
	"CheckAuth": "/checkAuth",
	"Config": "/config",
	"CSV": "/csv/:group.csv"
};

export const Routes = {
	"Welcome": "/",
	"Register": "/register",
	"StartRegistration": "/startRegistration",
	"Login": "/login",
    "Logout": "/logout",
    "ShibbolethMetadata": "/Shibboleth.sso/Metadata",
    "ShibbolethCallback": "/login/callback",
};