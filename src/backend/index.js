import http from 'http';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import api from 'controllers/api';
import frontend from 'controllers/frontend';
import config from 'config/config.json';
import MemoryStore from 'memorystore';
import session from 'express-session';
import passport from 'passport';
import saml from 'passport-saml';
import helmet from 'helmet';

let app = express();
if(process.env.NODE_ENV === 'production') {
	app.use("/assets", express.static('dist/assets'))
}
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(helmet());

const memStore = MemoryStore(session);
app.set('trust proxy', 1);
app.use(session({
	store: new memStore({
		checkPeriod: 86400000
	}),
	name: "sessionId",
	saveUninitialized: true,
	resave: false,
	secret: process.env.SessionKey || "development"
}));

if(process.env.SessionKey === "development") {
	console.error("Session is not secured, SessionKey environment variable must be set.");
}
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const uwSamlStrategy = new saml.Strategy(
	{
		callbackUrl: process.env.idpCallbackUrl,
		entryPoint: config.IdPEntryPoint,
		issuer: process.env.idpIssuer,
		identifierFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"
	},
	function(profile, done) {
		return done(null, {
			UWNetID: profile["urn:oid:0.9.2342.19200300.100.1.1"] || profile.nameID,
			DisplayName: profile["urn:oid:2.16.840.1.113730.3.1.241"]
		})
});

passport.use(uwSamlStrategy);

// date, host, method, url,response,time taken,remote host, remote ip, user agent
// 2018-08-13T17:01:10.498Z ::ffff:10.0.2.176 Anonymous GET / 200 ELB-HealthChecker/2.0 0.882 ms
// 2018-08-13T13:49:45.054|webservices.washington.edu|GET|/favicon.ico|404|5|10.0.2.176|10.0.2.176|Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134

app.use(morgan(function (tokens, req, res) {
	let user = "Anonymous";
	if(req.user) {
		user = req.user.UWNetID;
	} else if(req.session && req.session.user) {
		user = req.session.user.UWNetID;
	} else if(req.session && req.session.registrationUser) {
		user = "ActAs:" + req.session.registrationUser.UWNetID;
	}
	return [
		tokens.date(req,res,"iso"),
		req.headers.host,
		tokens.method(req,res),
		tokens.url(req,res),
		tokens.status(req,res),
		tokens['response-time'](req, res, 0),
		(tokens["remote-addr"](req,res)).replace("::ffff:", ""),
		user,
		tokens['user-agent'](req,res),
	].join('|');
}));

app.server = http.createServer(app);

app.get('/Shibboleth.sso/metadata', 
	function(req, res) {
	  res.type('application/xml');
	  res.status(200).send(uwSamlStrategy.generateServiceProviderMetadata());
	}
  );

app.use('/api', api);
app.use(['/','/config'], frontend);

app.server.listen(process.env.PORT || config.port || 1111, () => {
	console.log(`Started on port ${app.server.address().port} in '${process.env.NODE_ENV}' environment.`);
});

// add some spiffy colors to the console output so it stands out
if(process.env.NODE_ENV === 'development') {
	[
		['warn', '\x1b[43m\x1b[1m\x1b[37m'],
		['error', '\x1b[41m\x1b[1m\x1b[37m'],
		['log', '\x1b[42m\x1b[1m\x1b[37m']
	].forEach(function(pair) {
		var method = pair[0], reset = '\x1b[0m', color = '\x1b[36m' + pair[1];
		console[method] = console[method].bind(console, color, method.toUpperCase(), reset);
	});
}

export default app;
