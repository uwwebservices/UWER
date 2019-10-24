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
import responseTime from 'response-time';
import passport from 'passport';
import saml from 'passport-saml';
import helmet from 'helmet';
import metrics from './metrics';

const NODE_ENV = process.env.NODE_ENV;
const SECRET_KEY = process.env.SESSIONKEY || 'development';
const BASE_GROUP = process.env.BASE_GROUP;
const GRAPHITE_HOSTNAME = process.env.GRAPHITE_HOSTNAME || '';
const GRAPHITE_PREFIX = process.env.GRAPHITE_PREFIX || 'test';

let app = express();

app.use(cookieParser(SECRET_KEY));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());
app.set('trust proxy', 1);

// Required for passport to setup a persistent login session
const memStore = MemoryStore(session);
app.use(
  session({
    store: new memStore({
      checkPeriod: 86400000
    }),
    name: 'sessionId',
    saveUninitialized: true,
    resave: false,
    secret: SECRET_KEY
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
    req.user = { UWNetID: 'steven20' };
    req.signedCookies.devMode = req.signedCookies.devMode || 'Authenticated';
    req.signedCookies.IAAAgreed = true;
    req.isAuthenticated = () => req.signedCookies.devMode === 'Authenticated';

    next();
  });
}

// Metrics; needs to come before morgan is setup
const metricService = 'uwer';
const metricInstance = BASE_GROUP.replace('uw_event_', '').replace(/_$/, '');
metrics.Setup(GRAPHITE_HOSTNAME, GRAPHITE_PREFIX, metricService, metricInstance);
metrics.IntervalFlush();
app.use(
  responseTime(function(req, res, time) {
    metrics.Push(time);
  })
);

// Log formatting
app.use(
  morgan(function(tokens, req, res) {
    let user = 'Anonymous';
    let identifier = req.body.identifier || '';
    if (req.user) {
      user = req.user.UWNetID;
    } else if (req.signedCookies && req.signedCookies.user) {
      user = 'ActAs:' + req.signedCookies.user.UWNetID;
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
app.use(['/'], frontend);

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
