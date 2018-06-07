// This will cover first load of pages but not SPA routing
export function ensureAuth() {
	return function (req, res, next) {
		if (req.isAuthenticated()) {
			console.log("Authenticated");
			return next();
		} else if(process.env.NODE_ENV === 'development') {
			console.log("Running in development mode - Auth Disabled");
			req.user = { UWNetID: 'DEVELOPMENT', DisplayName: 'Dev User' };
		}
		else {
			console.log("Not Authenticated");
			if (req.session) {
				console.log("originalUrl", req.originalUrl);
				console.log("authRedirectUrl", req.session.authRedirectUrl);
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
		console.log("Redirecting to:", url);
		res.redirect(url || "/");
	};
};

export function ensureAPIAuth(req, res, next) {
	if(req.isAuthenticated() || process.env.NODE_ENV === 'development') {
		return next();
	} else {
		res.json({"error": "Not Authenticated"});
	}
}