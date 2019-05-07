import fs from 'fs';
import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import api from 'controllers/api';
import frontend from 'controllers/frontend';
import MemoryStore from 'memorystore';
import session from 'express-session';
import passport from 'passport';
import saml from 'passport-saml';
import helmet from 'helmet';
import { extractAuthToken, encryptPayload } from './utils/helpers';

const NODE_ENV = process.env.NODE_ENV;

let app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());
app.use(extractAuthToken);
app.set('trust proxy', 1);

const memStore = MemoryStore(session);
app.use(
  session({
    store: new memStore({
      checkPeriod: 86400000
    }),
    name: 'sessionId',
    saveUninitialized: true,
    resave: false,
    secret: process.env.SESSIONKEY || 'development'
  })
);

if (NODE_ENV === 'production') {
  app.use('/assets', express.static('dist/assets'));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  const spPrivateKey = process.env.SPKEYFILE ? fs.readFileSync(process.env.SPKEYFILE, { encoding: 'utf8' }) : '';

  passport.use(
    new saml.Strategy(
      {
        callbackUrl: process.env.IDPCALLBACKURL,
        entryPoint: process.env.IDPENTRYPOINT,
        issuer: process.env.IDPISSUER,
        identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
        privateKey: spPrivateKey
      },
      function(profile, done) {
        return done(null, {
          UWNetID: profile['urn:oid:0.9.2342.19200300.100.1.1'] || profile.nameID,
          DisplayName: profile['urn:oid:2.16.840.1.113730.3.1.241']
        });
      }
    )
  );
} else if (NODE_ENV === 'development') {
  // Middleware to mock a login in development mode
  app.use(function(req, res, next) {
    req.session = req.session || {};
    req.session.loggedOut = req.session.loggedOut || false;

    req.user = { UWNetID: 'steven20' };

    req.cookies = req.cookies || {};
    req.cookies.auth = encryptPayload({ Authenticated: !req.session.loggedOut, IAAAgreed: true });

    req.isAuthenticated = () => !req.session.loggedOut;
    next();
  });
}

// Log formatting
app.use(
  morgan(function(tokens, req, res) {
    let user = 'Anonymous';
    let identifier = req.body.identifier || '';
    if (req.user) {
      user = req.user.UWNetID;
    } else if (req.settings && req.settings.user) {
      user = 'ActAs:' + req.settings.user.UWNetID;
    }

    let logMessage = [
      tokens.date(req, res, 'iso'),
      req.headers.host,
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens['response-time'](req, res, 0),
      tokens['remote-addr'](req, res).replace('::ffff:', ''),
      user,
      tokens['user-agent'](req, res)
    ].join('|');
    if (identifier !== '') {
      logMessage += `|id=${identifier}`;
    }
    return logMessage;
  })
);

app.server = http.createServer(app);

app.use('/api', api);
app.use(['/', '/config'], frontend);

app.server.listen(process.env.PORT || 1111, () => {
  console.log(`Started on port ${app.server.address().port} in '${NODE_ENV}' environment.`);
});

// add some spiffy colors to the console output so it stands out
if (NODE_ENV === 'development') {
  [['warn', '\x1b[43m\x1b[1m\x1b[37m'], ['error', '\x1b[41m\x1b[1m\x1b[37m'], ['log', '\x1b[42m\x1b[1m\x1b[37m']].forEach(function(pair) {
    var method = pair[0],
      reset = '\x1b[0m',
      color = '\x1b[36m' + pair[1];
    console[method] = console[method].bind(console, color, method.toUpperCase(), reset);
  });
}

export default app;
