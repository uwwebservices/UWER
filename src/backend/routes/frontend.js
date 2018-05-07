import { Router } from 'express';
import path from 'path';

let api = Router();

if(process.env.NODE_ENV === 'dev') {
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

if(process.env.NODE_ENV === 'prod'){
	api.get(['/', '/config'], (req, res) => {
		res.sendFile(path.resolve(__dirname, '..', '..', 'index.html'));
 });
}


export default api;