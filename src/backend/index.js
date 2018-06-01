import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import api from 'controllers/api';
import frontend from 'controllers/frontend';
import config from 'config/config.json';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import saml from 'passport-saml';

let app = express();
// static files
if(process.env.NODE_ENV === 'production') {
	app.use("/assets", express.static('dist/assets'))
}
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({ 
	secret: 'ewsr0x', 
	resave: true, 
	saveUnitialized: true,
	cookie: { secure: false, maxAge: (4*60*60*1000)}
}));
app.use(passport.initialize());
app.use(passport.session());

// logger
app.use(morgan('dev'));

app.use(cors({
	exposedHeaders: ["Link"]
}));

let samlStrategy = new saml.Strategy(
	{
		callbackUrl: 'https://idcard-poc-staging.herokuapp.com/login/callback',
		entryPoint: 'https://idp.u.washington.edu/idp/profile/SAML2/Redirect/SSO',
		issuer: 'http://ccan.cac.washington.edu/idcard',
		identifierFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"
	},
	function(profile, done) {
		console.log("OMG PROFILE", profile);
		return done(null, {
			UWNetID: profile.nameID
		})
});

passport.serializeUser(function(user, done) {
	console.log("SERIALIZE USER", user);
  done(null, user);
});

passport.deserializeUser(function(user, done) {
	console.log("DESERIALIZE USER", user);
  done(null, user);
});

passport.use(samlStrategy);

app.server = http.createServer(app);

// api router
app.use('/api', api);

// frontend
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
