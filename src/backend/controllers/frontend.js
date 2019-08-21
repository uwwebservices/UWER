import { Router } from 'express';
import path from 'path';
import passport from 'passport';
import { ensureAuth, backToUrl, uwerSetCookieDefaults } from '../utils/helpers';
import { Routes } from 'Routes';
import Groups from 'models/groupModel';

let app = Router();

const BASE_GROUP = process.env.BASE_GROUP;
const NODE_ENV = process.env.NODE_ENV;

if (NODE_ENV === 'development') {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackConfig = require('../../../webpack.dev.config')(process.env);
  let compiler = webpack(webpackConfig);

  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      stats: { colors: true },
      watchOptions: {
        ignored: [path.resolve(__dirname, '..', 'config')]
      }
    })
  );
  app.use(
    webpackHotMiddleware(compiler, {
      log: console.log,
      reload: true
    })
  );
  // If you run into a weird "No such file or directory" error here, likely an import failed somewhere
  app.get('*', ensureAuth(), (req, res, next) => {
    var filename = path.join(compiler.outputPath, 'index.html');
    compiler.outputFileSystem.readFile(filename, function(err, result) {
      if (err) {
        return next(err);
      }
      res.set('content-type', 'text/html');
      res.send(result);
      res.end();
    });
  });
}

// Shibboleth Routes
app.get(
  Routes.Login,
  function(req, res, next) {
    res.cookie('authRedirectUrl', req.query.returnUrl, { ...uwerSetCookieDefaults, signed: false, maxAge: 5 * 60 * 1000 });
    next();
  },
  passport.authenticate('saml', { failureRedirect: Routes.Welcome, failureFlash: true })
);

app.post(
  '/login/callback',
  passport.authenticate('saml', { failureRedirect: Routes.Welcome, failureFlash: true }),
  async (req, res, next) => {
    // admins are the effective members of the base group
    let admins = await Groups.GetEffectiveMembers(BASE_GROUP.slice(0, -1));

    if (admins && admins.indexOf(req.user.UWNetID) > -1) {
      next();
    } else {
      console.log(`User ${req.user.UWNetID} is not in the ${BASE_GROUP.slice(0, -1)} group, admins: ${JSON.stringify(admins)}`);
      req.logout();
      res.redirect(Routes.NotAuthorized);
    }
  },
  backToUrl()
);

// This route must be the very last one or things get wonky in production
if (process.env.NODE_ENV === 'production') {
  app.get([...Routes], (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', '..', 'index.html'));
  });
}

export default app;
