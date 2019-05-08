import { AES, enc } from 'crypto-js';
import { Routes } from 'Routes';
import Groups from 'models/groupModel';

const SESSIONKEY = process.env.SESSIONKEY;

export const ensureAuth = (returnUrl = '/') => {
  return function(req, res, next) {
    const devVerifiedAuthToken = process.env.NODE_ENV === 'development' && verifyAuthToken(req);
    if (req.isAuthenticated() || devVerifiedAuthToken) {
      return next();
    } else {
      if (req.session) {
        req.session.authRedirectUrl = req.originalUrl;
      } else {
        console.warn('passport-uwshib: No session property on request! Is your session store unreachable?');
      }
      res.redirect(Routes.Login);
    }
  };
};

export const backToUrl = (url = Routes.Register) => {
  return function(req, res) {
    if (req.session) {
      url = req.session.authRedirectUrl;
      delete req.session.authRedirectUrl;
    }
    res.redirect(url || Routes.Register);
  };
};

export const idaaRedirectUrl = req => {
  return encodeURI(req.protocol + '://' + req.get('host') + '/config');
};

export const ensureAPIAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.sendStatus(401);
  }
};

export const ensureAuthOrToken = (req, res, next) => {
  if (req.isAuthenticated() || verifyAuthToken(req)) {
    return next();
  } else {
    res.sendStatus(401);
  }
};

export const getAuthToken = async (req, groupName, netidAllowed = false, ttl = 180) => {
  let now = new Date();
  let expiry = now.setMinutes(now.getMinutes() + ttl);
  let user = req.user;
  let confidential = await Groups.IsConfidentialGroup(groupName);
  let token = { user, groupName, confidential, netidAllowed, expiry };
  return token;
};

export const extractAuthToken = async (req, res, next) => {
  // Decrypt/extract the token data from the request cookie for use elsewhere in the application
  if (req.signedCookies && req.signedCookies.registrationToken) {
    try {
      req.settings = req.signedCookies.registrationToken;
    } catch (ex) {
      console.log('Unable to decrypt token data', ex);
    }
  }

  return next();
};

export const verifyAuthToken = req => {
  // See: extractAuthToken; if req.settings is undefined the request didn't have a token
  if (req.settings === undefined) {
    return false;
  }

  console.log(`verifyAuthToken, token expires: ${new Date(req.settings.expiry)}, now: ${new Date()}`);
  return req.settings.expiry > new Date().getTime();
};

export const requestSettingsOverrides = async (req, res, next) => {
  let overrides = {};

  // Override the token if the user is authenticated
  if (req.isAuthenticated()) {
    overrides.groupName = req.params.group;
    overrides.netidAllowed = req.isAuthenticated();
    overrides.confidential = !req.isAuthenticated();
  }

  req.settings = { ...req.settings, ...overrides };

  next();
};

export const FilterModel = (model, whitelist) => {
  return Object.keys(model)
    .filter(key => whitelist.includes(key))
    .reduce((obj, key) => {
      obj[key] = model[key];
      return obj;
    }, {});
};
