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
}

api.get(['/','/config'], (req, res) => {
	 res.sendFile(path.resolve(__dirname, '..', '..', 'index.html'));
});

export default api;