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
	secret: process.env.SessionKey || "devlopment"
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
			UWNetID: profile.nameID,
			DisplayName: profile["urn:oid:2.16.840.1.113730.3.1.241"]
		})
});

passport.use(uwSamlStrategy);

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
		tokens["remote-addr"](req,res),
		user,
		tokens.method(req,res),
		tokens.url(req,res),
		tokens.status(req,res),
		tokens['response-time'](req, res), 'ms'
	].join(' ');
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
