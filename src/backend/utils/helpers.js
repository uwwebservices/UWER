export function ensureAuth(adminOnly = false) {
	return function (req, res, next) {
		if (req.isAuthenticated() || process.env.NODE_ENV === 'development') {
			console.log("Authenticated");
			return next();
		}
		else {
			console.log("Not Authenticated");
			if (req.session) {
				console.log('orig url', req.originalUrl)
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
			url = req.session.authRedirectUrl || req.params.returnUrl || "/";
			delete req.session.authRedirectUrl;
		}
		res.redirect(url);
	};
};

export function ensureAPIAuth(req, res, next) {
	if(req.isAuthenticated() || process.env.NODE_ENV === 'development') {
		return next();
	} else {
		res.json({"error": "Not Authenticated"});
	}
}