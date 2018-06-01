import { Router } from 'express';
import path from 'path';
import passport from 'passport';
import fs from 'fs';
import { ensureAuth, backToUrl } from '../utils/helpers';

let app = Router();

let admins = ["ccan"];

// Shibboleth Routes
app.get('/login', 
	function(req, res, next) {
		req.session.authRedirectUrl = req.query.returnUrl;
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
	app.get('/', (req, res) => {
		res.sendFile(path.resolve(__dirname, '..', '..', 'index.html'));
	});
	app.get('/config', ensureAuth(), (req, res) => {
		res.sendFile(path.resolve(__dirname, '..', '..', 'index.html'));
	});
}

export default app;