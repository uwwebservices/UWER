import { Router } from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../../webpack.dev.config';
import fs from 'fs';

let api = Router();

if(process.env.NODE_ENV === 'dev') {
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

api.get('/', (req, res) => {
	 res.sendFile(__dirname + '/index.html');
});

export default api;