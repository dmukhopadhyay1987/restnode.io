var ERROR_RESPONSES = require('../err/error_repo');
var jwt = require('jsonwebtoken');
var authConfig = require('./auth_config');
var rofl = require('../log/file_logger');

var LAST_TOKEN = "";
var authenabled = authConfig.jwt.enabled || authConfig.manual.enabled;
if (authenabled) {
  rofl.info('', {}, 'auth service enabled');
} else {
  rofl.warn('', {}, 'auth service disabled');
}

class EPODSAuth {
  
  token (req, res) {
    var execid = Date.now();
    if (authenabled) {
      rofl.info(execid, {}, 'Auth enabled');
      let username = req.body.username;
      let password = req.body.password;

      if (username && 
        password && 
        username == authConfig.credential.username &&
        password == authConfig.credential.password) {
        rofl.info(execid, {}, 'Credentials validated.');
        var token;
        if (authConfig.jwt.enabled) {
          rofl.info(execid, {}, 'Signing token');
          token = LAST_TOKEN || (LAST_TOKEN = jwt.sign(
            {
              username: username
            },
            authConfig.jwt.secret,
            {
              expiresIn: authConfig.jwt.ttl
            }
          ));
        } else if (authConfig.manual.enabled) {
          rofl.info(execid, {}, 'Signing token');
          token = authConfig.manual.secret;
        }
        // return the JWT token for the future API calls
        let response = ERROR_RESPONSES.SUCCESS;
        response.token = token;
        rofl.info(execid, {}, 'Auth token generated');
        return res.json(response);
      } else {
        rofl.error(execid, {}, 'Wrong credentials');
        return res.json(ERROR_RESPONSES.ERR_CREDENTIAL);
      }
    } else {
      rofl.warn(execid, {}, 'Token auth disabled');
      return res.json(ERROR_RESPONSES.ERR_TOKEN);
    }
    
  };

  validateToken (req, res, next) {
    // Express headers are auto converted to lowercase
    let token = req.headers['epods-access-token'] || req.headers['authorization'];
    if (req.path.indexOf('/restnode.io/service/i/') <= -1 && authenabled) {
      rofl.info('', req, 'Token validation bypassed');
      next();
    } else if (authenabled) {
      rofl.info('', req, 'Auth enabled');
      if (token) {
        rofl.info('', req, 'Reading token');
        if (token.startsWith('Bearer ')) {
          // Remove Bearer from string
          token = token.slice(7, token.length);
        }
        if (authConfig.jwt.enabled) {
          rofl.info('', req, 'Verifying token');
          jwt.verify(token, authConfig.jwt.secret, (err, decoded) => {
            if (err) {
              rofl.error('', req, 'Authentication Error', err.message);
              if (err.message.toLowerCase().indexOf('expired') > -1) LAST_TOKEN = "";
              return res.json(ERROR_RESPONSES.ERR_AUTH);
            } else if (decoded && decoded.username && decoded.username == authConfig.credential.username) {
              rofl.info('', req, 'Authenticated');
              next();
            } else {
              rofl.error('', req, 'Authentication Error');
              LAST_TOKEN = "";
              return res.json(ERROR_RESPONSES.ERR_AUTH);
            }
          });
        } else if (authConfig.manual.enabled) {
          rofl.info('', req, 'Verifying token');
          if (token === authConfig.manual.secret) {
            rofl.info('', req, 'Authenticated');
            next();
          } else {
            rofl.error('', req, 'Authentication Error');
            return res.json(ERROR_RESPONSES.ERR_AUTH);
          }
        }
      } else {
        rofl.error('', req, 'Authentication Error');
        return res.json(ERROR_RESPONSES.ERR_AUTH);
      }
    } else {
      rofl.warn('', req, 'Authentication disabled');
      next();
    }
  };
};

module.exports = new EPODSAuth();