import fs from 'fs';
import http from 'http';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import api from 'controllers/api';
import frontend from 'controllers/frontend';
import MemoryStore from 'memorystore';
import session from 'express-session';
import passport from 'passport';
import saml from 'passport-saml';
import helmet from 'helmet';

const SPKEYFILE = process.env.SPKEYFILE;
const IDPCALLBACKURL = process.env.IDPCALLBACKURL;
const IDPISSUER = process.env.IDPISSUER;
const IDPENTRYPOINT = process.env.IDPENTRYPOINT;
const PORT = process.env.PORT || 1111;
const NODE_ENV = process.env.NODE_ENV;
const SESSIONKEY = process.env.SESSIONKEY;

let app = express();
if (NODE_ENV === 'production') {
  app.use('/assets', express.static('dist/assets'));
}
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.use(helmet());

const memStore = MemoryStore(session);
app.set('trust proxy', 1);
app.use(
  session({
    store: new memStore({
      checkPeriod: 86400000
    }),
    name: 'sessionId',
    saveUninitialized: true,
    resave: false,
    secret: SESSIONKEY || 'development'
  })
);

if (SESSIONKEY === 'development') {
  console.error('Session is not secured, SessionKey environment variable must be set.');
}

if (NODE_ENV === 'production') {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
} else {
  // Middleware to mock a login in development mode
  app.use(function(req, res, next) {
    req.session = req.session || {};
    req.isAuthenticated = () => true;
    req.user = { UWNetID: 'steven20' };
    req.session.IAAAgreed = true;
    next();
  });
}

const spPrivateKey = SPKEYFILE ? fs.readFileSync(SPKEYFILE, { encoding: 'utf8' }) : '';

const uwSamlStrategy = new saml.Strategy(
  {
    callbackUrl: IDPCALLBACKURL,
    entryPoint: IDPENTRYPOINT,
    issuer: IDPISSUER,
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
    privateKey: spPrivateKey
  },
  function(profile, done) {
    return done(null, {
      UWNetID: profile['urn:oid:0.9.2342.19200300.100.1.1'] || profile.nameID,
      DisplayName: profile['urn:oid:2.16.840.1.113730.3.1.241']
    });
  }
);

passport.use(uwSamlStrategy);

// date, host, method, url,response,time taken,remote host, remote ip, user agent
// 2018-08-13T17:01:10.498Z ::ffff:10.0.2.176 Anonymous GET / 200 ELB-HealthChecker/2.0 0.882 ms
// 2018-08-13T13:49:45.054|webservices.washington.edu|GET|/favicon.ico|404|5|10.0.2.176|10.0.2.176|Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134

app.use(
  morgan(function(tokens, req, res) {
    let user = 'Anonymous';
    let identifier = req.body.identifier || '';
    if (req.user) {
      user = req.user.UWNetID;
    } else if (req.session && req.session.user) {
      user = req.session.user.UWNetID;
    } else if (req.session && req.session.registrationUser) {
      user = 'ActAs:' + req.session.registrationUser.UWNetID;
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

app.get('/Shibboleth.sso/metadata', function(req, res) {
  res.type('application/xml');
  res.status(200).send(uwSamlStrategy.generateServiceProviderMetadata());
});

app.use('/api', api);
app.use(['/', '/config'], frontend);

app.server.listen(PORT, () => {
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
