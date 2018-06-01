import { Router } from 'express';
import path from 'path';
import passport from 'passport';
import fs from 'fs';

let app = Router();

function ensureAuth(loginUrl="/login") {
	return function(req, res, next) {
			if (req.isAuthenticated())
					return next();
			else {
					if (req.session) {
							req.session.authRedirectUrl = req.originalUrl;
					}
					else {
							console.warn('passport-uwshib: No session property on request! Is your session store unreachable?');
					}
					res.redirect(loginUrl);
			}
	};
};

function backToUrl(url = "/") {
	return function(req, res) {
			if (req.session) {
					url = req.session.authRedirectUrl;
					delete req.session.authRedirectUrl;
			}
			res.redirect(url);
	};
};

app.get('/test', ensureAuth(), function(req, res) {
	res.send("you must be authenticated to reach this page, welcome: " + req.user.DisplayName + "!");
});

app.get('/login', 
	passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
	backToUrl()
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
	app.get('*', (req, res, next) => {
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
	app.get(['/', '/config'], (req, res) => {
		console.log("req.user", req.user);
		console.log("req.session", req.session);
		console.log("req.session.passport", req.session.passport);
		res.sendFile(path.resolve(__dirname, '..', '..', 'index.html'));
 });
}

export default app;