// This will cover first load of pages but not SPA routing
export function ensureAuth() {
	return function (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else if(process.env.NODE_ENV === 'development') {
			console.log("Running in development mode - Auth Disabled");
			req.session.user = { UWNetID: 'DEVELOPMENT', DisplayName: 'Dev User' };
			return next();
		}
		else {
			if (req.session) {
				req.session.authRedirectUrl = req.originalUrl;
			}
			else {
				console.warn('passport-uwshib: No session property on request! Is your session store unreachable?');
			}
			res.redirect("/login");
		}
	};
};

export function backToUrl(url = "/") {
	return function (req, res) {
		if (req.session) {
			url = req.session.authRedirectUrl;
			delete req.session.authRedirectUrl;
		}
		res.redirect(url || "/");
	};
};

export function ensureAPIAuth(req, res, next) {
	if(req.isAuthenticated() || process.env.NODE_ENV === 'development') {
		return next();
	} else {
		res.sendStatus(401);
	}
}