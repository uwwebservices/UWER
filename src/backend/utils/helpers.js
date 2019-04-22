import { AES, enc } from 'crypto-js';
import { Routes } from 'Routes';
import Groups from 'models/groupModel';

const SESSIONKEY = process.env.SESSIONKEY;

export const ensureAuth = (returnUrl = '/') => {
  return function(req, res, next) {
    if (req.isAuthenticated()) {
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

export const getAuthToken = (req, groupName, netidAllowed = false, ttl = 180, uriEncode = true) => {
  let now = new Date();
  let expiry = now.setMinutes(now.getMinutes() + ttl);
  let token = AES.encrypt(JSON.stringify({ user: req.user, groupName, netidAllowed, expiry }), SESSIONKEY).toString();
  return uriEncode ? encodeURIComponent(token) : token;
};

export const decryptAuthToken = token => {
  let payload = AES.decrypt(decodeURIComponent(token), SESSIONKEY).toString(enc.Utf8);
  return JSON.parse(payload);
};

export const verifyAuthToken = req => {
  if (!req.session.token && !req.body.token && !req.query.token) {
    return false;
  }
  if (!req.session.token && (req.body.token || req.query.token)) {
    req.session.token = req.body.token ? decodeURIComponent(req.body.token) : decodeURIComponent(req.query.token);
  }
  let tokenData = decryptAuthToken(req.session.token);
  console.log('verify, token expires:', new Date(tokenData.expiry));
  console.log('now', new Date());
  req.session.registrationUser = tokenData.user;
  return tokenData.expiry > new Date().getTime();
};

export const tokenToSession = async (req, res, next) => {
  // if user is not authenticated and presented a token, update session
  let groupName = req.params.group;
  let confidential = !req.isAuthenticated();
  let netidAllowed = req.isAuthenticated();

  if (!req.isAuthenticated() && req.body.token) {
    let tokenData = decryptAuthToken(req.body.token);
    groupName = tokenData.groupName;
    netidAllowed = tokenData.netidAllowed;
  }

  if (!req.session.group || req.session.group.groupName !== groupName) {
    confidential = await Groups.IsConfidentialGroup(groupName);
  } else if (req.session.group) {
    confidential = req.session.group.confidential;
  }

  // Admins and Developers can see confidential group members
  if (req.isAuthenticated()) {
    confidential = false;
  }

  req.session.group = {
    groupName,
    confidential,
    netidAllowed
  };

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
