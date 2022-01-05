import { Routes } from 'Routes';

const NODE_ENV = process.env.NODE_ENV;
const BASE_GROUP = process.env.BASE_GROUP;

export const uwerSetCookieDefaults = { path: '/', httpOnly: true, signed: true };

export const getFullGroupName = groupName => `${BASE_GROUP}${groupName}`;

export const ensureAuth = (returnUrl = '/') => {
  return function(req, res, next) {
    if (req.isAuthenticated() || devModeAuthenticated(req)) {
      return next();
    } else {
      res.redirect(`${Routes.Login}?returnUrl=${returnUrl}`);
    }
  };
};

export const setDevModeCookie = (res, val) => {
  if (NODE_ENV !== 'development') {
    return;
  }

  if (val === null) {
    res.clearCookie('devMode', { path: '/' });
  } else {
    res.cookie('devMode', val, uwerSetCookieDefaults);
  }
};

const devModeAuthenticated = req => {
  if (NODE_ENV !== 'development') {
    return false;
  }

  return req.signedCookies.devMode && (req.signedCookies.devMode == 'Authenticated' || req.signedCookies.devMode == 'Token');
};

export const backToUrl = (url = Routes.Register) => {
  return function(req, res) {
    console.log(`backToUrl: cookie authRedirectUrl: ${req.cookies.authRedirectUrl}`);
    res.redirect(req.cookies.authRedirectUrl || Routes.Register);
  };
};

export const idaaRedirectUrl = req => {
  return encodeURI(req.protocol + '://' + req.get('host') + '/config');
};

const ensureAPIAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.sendStatus(401);
  }
};

const ensureAuthOrToken = (req, res, next) => {
  if (req.isAuthenticated() || verifyAuthToken(req)) {
    return next();
  } else {
    res.sendStatus(401);
  }
};

const ensureToken = (req, res, next) => {
  if (verifyAuthToken(req)) {
    return next();
  } else {
    res.sendStatus(401);
  }
};

const verifyAuthToken = req => {
  if (!req.signedCookies.registrationToken) {
    return false;
  }

  console.log(`verifyAuthToken, token expires: ${new Date(req.signedCookies.registrationToken.expiry)}, now: ${new Date()}`);
  return req.signedCookies.registrationToken.expiry > new Date().getTime();
};

const requestSettingsOverrides = async (req, res, next) => {
  let overrides = {};

  // Override the token if the user is authenticated
  if (req.isAuthenticated()) {
    overrides.groupName = req.params.group;
    overrides.netidAllowed = req.isAuthenticated();
    overrides.confidential = !req.isAuthenticated();
  }

  req.signedCookies.registrationToken = { ...req.signedCookies.registrationToken, ...overrides };

  next();
};

/**
 * The API will enforce the use of the BASE_GROUP prefix
 * The frontend will send the group name without the BASE_GROUP prefix.
 * This function needs to verify the group of the route matches the group of the cookie.
 */
const ensureValidGroupName = async (req, res, next) => {
  const routeGroupName = req.params && req.params.group;
  const cookieGroupName = req.signedCookies.registrationToken && req.signedCookies.registrationToken.groupName;
  const routeCookieMismatch = !!routeGroupName && !!cookieGroupName && routeGroupName !== cookieGroupName;

  if (routeCookieMismatch) {
    return res.sendStatus(403);
  }

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

export const authOrTokenMiddleware = [ensureAuthOrToken, requestSettingsOverrides, ensureValidGroupName];

export const tokenMiddleware = [ensureToken, requestSettingsOverrides, ensureValidGroupName];

export const authMiddleware = [ensureAPIAuth, ensureValidGroupName];

export const baseMiddleware = [ensureAPIAuth];
