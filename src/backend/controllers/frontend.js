import { Router } from 'express';
import path from 'path';
import passport from 'passport';
import { ensureAuth, backToUrl, getAuthToken } from '../utils/helpers';
import { API, Routes } from 'Routes';

let app = Router();

// Shibboleth Routes
app.get(Routes.Login, 
	function(req, res, next) {
		req.session.authRedirectUrl = req.query.returnUrl ? req.query.returnUrl : req.session.authRedirectUrl;
		next();
	},
	passport.authenticate('saml', { failureRedirect: Routes.Welcome, failureFlash: true })
); 

app.post(Routes.ShibbolethCallback,
	passport.authenticate('saml', { failureRedirect: Routes.Welcome, failureFlash: true }),
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
	// If you run into a weird "No such file or directory" error here, likely an import failed somewhere
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
	app.get([Routes.Welcome, Routes.Register, API.Config], (req, res) => {
		res.sendFile(path.resolve(__dirname, '..', '..', 'index.html'));
	});
}

export default app;