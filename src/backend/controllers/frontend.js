import { Router } from 'express';
import path from 'path';
import passport from 'passport';
import saml from 'passport-saml';
import fs from 'fs';
import bodyParser from 'body-parser';

let samlStrategy = new saml.Strategy(
	{
    callbackUrl: 'https://idcard-poc-staging.herokuapp.com/login/callback',
    entryPoint: 'https://idp.u.washington.edu/idp/profile/SAML2/Redirect/SSO',
		issuer: 'http://ccan.cac.washington.edu/idcard',
		identifierFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"
  },
  function(profile, done) {
		console.log("OMG PROFILE", profile);
		return done(null, {
			email: profile.email
		})
	});

passport.use(samlStrategy);



let api = Router();
api.use(bodyParser.json({
	limit : "100kb"
}));

api.get('/test',
 passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function(req, res) {
	res.send("you must be authenticated to reach this page.");
});

api.get('/Shibboleth.sso/Metadata', 
  function(req, res) {
    res.type('application/xml');
    res.status(200).send(samlStrategy.generateServiceProviderMetadata());
  }
);
api.post('/login/callback',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  }
);

if(process.env.NODE_ENV === 'development') {
	const webpack = require('webpack');
	const webpackDevMiddleware = require('webpack-dev-middleware');
	const webpackHotMiddleware = require('webpack-hot-middleware');
	const webpackConfig = require('../../../webpack.dev.config');
	let compiler = webpack(webpackConfig);
	
	api.use(webpackDevMiddleware(compiler, {
		publicPath: webpackConfig.output.publicPath,
		stats: {colors: true},
		watchOptions: {
			ignored: [
				path.resolve(__dirname, '..', 'config')
			]
		}
	}))
	api.use(webpackHotMiddleware(compiler, {
		log: console.log,
		reload: true
	}))
	api.get('*', (req, res, next) => {
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
	api.get(['/', '/config'], (req, res) => {
		res.sendFile(path.resolve(__dirname, '..', '..', 'index.html'));
 });
}


export default api;