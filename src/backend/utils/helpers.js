export function ensureAuth(adminOnly = false) {
	return function (req, res, next) {
		if (req.isAuthenticated()) {
			console.log("Authenticated");
			return next();
		} else if(process.env.NODE_ENV === 'development') {
			console.log("Development Mode - Auth Bypassed");
			req.user = "Devlopment"; // I don't think this is right, but we want to set a default username or something
		}
		else {
			console.log("Not Authenticated");
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
		res.json({"error": "Not Authenticated"});
	}
}