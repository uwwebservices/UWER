import { Router } from 'express';
import path from 'path';
import passport from 'passport';
import { ensureAuth, backToUrl, getAuthToken } from '../utils/helpers';
import { Routes } from 'Routes';

let app = Router();

// Shibboleth Routes
app.get(Routes.Login, 
	function(req, res, next) {
		req.session.authRedirectUrl = req.query.returnUrl ? req.query.returnUrl : req.session.authRedirectUrl;
		next();
	},
	passport.authenticate('saml', { failureRedirect: Routes.Welcome, failureFlash: true })
); 
app.get(Routes.ShibbolethMetadata, 
  function(req, res) {
    res.type('application/xml');
    res.status(200).send(samlStrategy.generateServiceProviderMetadata());
  }
);
app.post(Routes.ShibbolethCallback,
	passport.authenticate('saml', { failureRedirect: Routes.Welcome, failureFlash: true }),
	backToUrl()
);

// completely log out
app.get(Routes.Logout, function(req, res){
  req.logout();
  res.redirect(Routes.Welcome);
});

// log out, but keep a token around so we know who is responsible
app.get(Routes.StartRegistration, function(req, res) {
	if(req.isAuthenticated) {
		let encryptedPayload = getAuthToken(req);
		req.logout();
		res.redirect(`${Routes.Register}?token=${encryptedPayload}`);
	} else {
		// if not shib'd, shib them and come back
		res.redirect(`${Routes.Login}?returnUrl=${Routes.StartRegistration}`);
	}
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
	app.get([Routes.Welcome, Routes.Register, Routes.Config], (req, res) => {
		res.sendFile(path.resolve(__dirname, '..', '..', 'index.html'));
	});
}

export default app;