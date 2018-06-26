export const Routes = {
	"Welcome": "/",
	"Register": "/register",
	"Config": "/config",
	"StartRegistration": "/startRegistration",
	"Login": "/login",
	"Logout": "/logout",
	"GetMembers": "/members/:group",
	"RegisterMember": "/members/:group/:identifier",
	"RemoveMember": "/members/:group/member/:identifier",
	"GetSubgroups": "/subgroups/:group",
	"RemoveSubgroup": "/subgroups/:group",
	"CreateGroup": "/subgroups/:group",
	"CheckAuth": "/checkAuth",
	"CSV": "/csv/:group.csv",
	"ShibbolethMetadata": "/Shibboleth.sso/Metadata",
	"ShibbolethCallback": "/login/callback"
};
	
export const ensureAuth = () => {
	return function (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else if(process.env.NODE_ENV === 'development') {
			console.log("Running in development mode - Auth Disabled");
			return next();
		}
		else {
			if (req.session) {
				req.session.authRedirectUrl = req.originalUrl;
			}
			else {
				console.warn('passport-uwshib: No session property on request! Is your session store unreachable?');
			}
			res.redirect(Routes.Login);
		}
	};
};

export const backToUrl = (url = Routes.Register) => {
	return function (req, res) {
		if (req.session) {
			url = req.session.authRedirectUrl;
			delete req.session.authRedirectUrl;
		}
		res.redirect(url || Routes.Register);
	};
};

export const ensureAPIAuth = (req, res, next) => {
	if(req.isAuthenticated() || process.env.NODE_ENV === 'development') {
		return next();
	} else {
		res.sendStatus(401);
	}
}

export const getAuthToken = req => {
	let passphrase = process.env.SessionKey || "development";
	let now = new Date();
	let expiry = now.setHours(now.getHours() + 1);
	return encodeURIComponent(AES.encrypt(JSON.stringify({user: req.user, expiry}), passphrase));
}
export const verifyAuthToken = value => {
	let passphrase = process.env.SessionKey || "development";
	return AES.decrypt(value, passphrase).toString(enc.Utf8);
}