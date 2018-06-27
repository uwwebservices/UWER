import { AES, enc } from 'crypto-js';
import { Routes } from 'Routes';
	
export const ensureAuth = (returnUrl = "/") => {
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
	let token = AES.encrypt(JSON.stringify({user: req.user, expiry}), passphrase).toString();
	req.session.token = token;
	return encodeURIComponent(token);
}

export const verifyAuthToken = req => {
	if(!req.session.token) { return false; }
	let passphrase = process.env.SessionKey || "development";
	let payload = AES.decrypt(req.session.token, passphrase).toString(enc.Utf8);
	req.session.user.UWNetID = payload.user.UWNetID; //should enable logging
	return payload.expiry > (new Date()).getTime();
}