import { Router } from 'express';

let api = Router();

if(process.env.NODE_ENV === 'dev') {
	const webpack = require('webpack');
	const webpackDevMiddleware = require('webpack-dev-middleware');
	const webpackHotMiddleware = require('webpack-hot-middleware');
	const webpackConfig = require('../../webpack.dev.config');
	let compiler = webpack(webpackConfig);

	api.use(webpackDevMiddleware(compiler, {
		publicPath: webpackConfig.output.publicPath,
		stats: {colors: true}
	}))
	api.use(webpackHotMiddleware(compiler, {
		log: console.log,
		reload: true
	}))
}

api.get('/*', (req, res) => {
	 res.sendFile(__dirname + '/views/index.html');
});

export default api;