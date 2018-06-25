import { Router } from 'express';
import path from 'path';
import passport from 'passport';
import fs from 'fs';
import { ensureAuth, backToUrl } from '../utils/helpers';
import { AES, enc } from 'crypto-js';

let app = Router();

let admins = ["ccan"];

let passphrase = process.env.SessionKey || "development";

let encrypt = value => {
	return AES.encrypt(value, passphrase);
}
let decrypt = value => {
	return AES.decrypt(value, passphrase).toString(enc.Utf8);
}

// Shibboleth Routes
app.get('/login', 
	function(req, res, next) {
		req.session.authRedirectUrl = req.query.returnUrl ? req.query.returnUrl : req.session.authRedirectUrl;
		next();
	},
	passport.authenticate('saml', { failureRedirect: '/', failureFlash: true })
); 
app.get('/Shibboleth.sso/Metadata', 
  function(req, res) {
    res.type('application/xml');
    res.status(200).send(samlStrategy.generateServiceProviderMetadata());
  }
);
app.post('/login/callback',
	passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
	backToUrl()
);

// completely log out
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/startRegistration', function(req, res) {
	let now = new Date();
	let expiry = now.setHours(now.getHours() + 1);
	let encryptedPayload = encrypt(JSON.stringify({user: req.user, expiry }));
	console.log("DECRYPTED", (decrypt(encryptedPayload)));
	req.logout();
	
	req.session.registrationEnabledTimeout = expiry;

	res.redirect('/register');
});

if(process.env.NODE_ENV === 'development') {
	const webpack = require('webpack');
	const webpackDevMiddleware = require('webpack-dev-middleware');
	const webpackHotMiddleware = require('webpack-hot-middleware');
	const webpackConfig = require('../../../webpack.dev.config');
	let compiler = webpack(webpackConfig);
	
	app.use(webpackDevMiddleware(compiler, {
		publicPath: webpackConfig.output.publicPath,
		stats: {colors: true},
		watchOptions: {
			ignored: [
				path.resolve(__dirname, '..', 'config')
			]
		}
	}))
	app.use(webpackHotMiddleware(compiler, {
		log: console.log,
		reload: true
	}))
	app.get('*', ensureAuth(), (req, res, next) => {
		var filename = path.join(compiler.outputPath,'index.html');
		compiler.outputFileSystem.readFile(filename, function(err, result){
			if (err) {
				return next(err);
			}
			res.set('content-type','text/html');
			res.send(result);
			res.end();
		});
	});
}

if(process.env.NODE_ENV === 'production') {
	app.get('/', (req, res) => {
		res.sendFile(path.resolve(__dirname, '..', '..', 'index.html'));
	});
	app.get('/config', ensureAuth(), (req, res) => {
		res.sendFile(path.resolve(__dirname, '..', '..', 'index.html'));
	});
}

export default app;