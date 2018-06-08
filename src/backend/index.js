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

let app = express();
if(process.env.NODE_ENV === 'production') {
	app.use("/assets", express.static('dist/assets'))
}
app.use(bodyParser.urlencoded({extended: false}));

const memStore = MemoryStore(session);

app.use(session({
	store: new memStore({
		checkPeriod: 86400000
	}),
	saveUninitialized: true,
	secret: process.env.SessionKey || "devlopment"
}));

// app.use(session({ 
// 	secret: process.env.SessionKey || "devlopment", 
// 	resave: true, 
// 	saveUninitialized: true,
// 	cookie: { secure: false, maxAge: (4*60*60*1000)}
// }));

if(process.env.SessionKey === "development") {
	console.error("Session is not secured, SessionKey environment variable must be set.");
}
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const uwSamlStrategy = new saml.Strategy(
	{
		callbackUrl: 'https://idcard-poc-staging.herokuapp.com/login/callback',
		entryPoint: 'https://idp.u.washington.edu/idp/profile/SAML2/Redirect/SSO',
		issuer: 'http://ccan.cac.washington.edu/idcard',
		identifierFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"
	},
	function(profile, done) {
		return done(null, {
			UWNetID: profile.nameID,
			DisplayName: profile["urn:oid:2.16.840.1.113730.3.1.241"]
		})
});

passport.use(uwSamlStrategy);

app.use(morgan('dev'));

app.server = http.createServer(app);

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
