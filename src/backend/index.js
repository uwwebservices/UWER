import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import api from 'routes/api';
import frontend from 'routes/frontend';
import configurator from 'utils/configurator';
let config = configurator.get();

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: ["Link"]
}));

app.use(bodyParser.json({
	limit : "100kb"
}));

// api router
app.use('/api', api);

// frontend
app.use(['/','/config'], frontend);

// static files
if(process.env.NODE_ENV === 'prod') {
	app.use("/assets", express.static('dist/assets'))
}

app.server.listen(process.env.PORT || config.port, () => {
	console.log(`Started on port ${app.server.address().port} in '${process.env.NODE_ENV}' environment.`);
});

// add some spiffy colors to the console output so it stands out
if(process.env.NODE_ENV === 'dev') {
	[
		[ 'warn',  '\x1b[43m\x1b[1m\x1b[37m' ],
		[ 'error', '\x1b[41m\x1b[1m\x1b[37m' ],
		[ 'log',   '\x1b[42m\x1b[1m\x1b[37m'  ]
	].forEach(function(pair) {
		var method = pair[0], reset = '\x1b[0m', color = '\x1b[36m' + pair[1];
		console[method] = console[method].bind(console, color, method.toUpperCase(), reset);
	});
}

export default app;
