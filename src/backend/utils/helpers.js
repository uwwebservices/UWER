import { Routes } from 'Routes';

export const ensureAuth = (returnUrl = '/') => {
  return function(req, res, next) {
    const devVerifiedAuthToken = process.env.NODE_ENV === 'development' && verifyAuthToken(req);
    if (req.isAuthenticated() || devVerifiedAuthToken) {
      return next();
    } else {
      res.redirect(`${Routes.Login}?returnUrl=${returnUrl}`);
    }
  };
};

export const backToUrl = (url = Routes.Register) => {
  return function(req, res) {
    res.redirect(req.cookies.authRedirectUrl || Routes.Register);
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

export const verifyAuthToken = req => {
  if (!req.signedCookies.registrationToken) {
    return false;
  }

  console.log(`verifyAuthToken, token expires: ${new Date(req.signedCookies.registrationToken.expiry)}, now: ${new Date()}`);
  return req.signedCookies.registrationToken.expiry > new Date().getTime();
};

export const requestSettingsOverrides = async (req, res, next) => {
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

export const FilterModel = (model, whitelist) => {
  return Object.keys(model)
    .filter(key => whitelist.includes(key))
    .reduce((obj, key) => {
      obj[key] = model[key];
      return obj;
    }, {});
};
