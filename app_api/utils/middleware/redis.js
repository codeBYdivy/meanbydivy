'use strict';

var debug = require('debug')('app:redis:' + process.pid);
var _ = require('lodash');
var jsonwebtoken = require('jsonwebtoken');
var TOKEN_EXPIRATION = 60;
var TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION * 60;
var UnauthorizedAccessError = require('../errors/UnauthorizedAccessError');
var redisConnection = require('../../config/db').redisConnection;

/**
 * Update the expiry time for "data.token" in redis
 * @param data
 * @param callback
 * @returns {*}
 */
var updateExpiryInRedis = function(data, callback) {
    debug('Updating expiry for token: %s', data.token);
    return redisConnection.expire(data.token, TOKEN_EXPIRATION_SEC, function(err, reply) {
        if (err) {
            return callback(new Error("expiry_error"), {
                "message": "Can not update the expire value for the token key"
            });
        }
        if (reply) {
            return callback(null, data);
        } else {
            return callback(new Error("expiry_error"), {
                "message": "Expiration not set on redis"
            });
        }
    });
};

/**
 * Find the authorization headers from the headers in the request
 * @param headers
 * @returns {*}
 */
var fetch = function(headers) {
    if (headers && headers.authorization) {
        var authorization = headers.authorization;
        var part = authorization.split(' ');
        if (part.length === 2) {
            var token = part[1];
            return part[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

/**
 * Creates a new token for the user that has been logged in
 * @param user
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
var createToken = function(userInfo, req, res, next) {

    debug('Create token');

    if (_.isEmpty(userInfo)) {
        return next(new Error('User data cannot be empty.'));
    }

    var data = userInfo;
    data.token = jsonwebtoken.sign({
            _id: userInfo._id,
            email: userInfo.email,
            name: userInfo.name
        },
        process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRATION + 'm' }
    );

    var decoded = jsonwebtoken.decode(data.token);

    data.token_exp = decoded.exp;
    data.token_iat = decoded.iat;

    debug('Token generated for user: %s, token: %s', data.username, data.token);

    redisConnection.set(data.token, JSON.stringify(data), function(err, reply) {
        if (err) {
            return next(new Error(err));
        }
        if (reply) {
            redisConnection.expire(data.token, TOKEN_EXPIRATION_SEC, function(err, reply) {
                if (err) {
                    return next(new Error('Can not set the expire value for the token key'));
                }
                if (reply) {
                    req.user = data;
                    next(); // we have succeeded
                } else {
                    return next(new Error('Expiration not set on redis'));
                }
            });
        } else {
            return next(new Error('Token not set in redis'));
        }
    });

    return data;

};

/**
 * Fetch the token from redis for the given key
 *
 * @param id
 * @param done
 * @returns {*}
 */
var retrieve = function(id, done) {

    debug('Calling retrieve for token: %s', id);

    if (_.isNull(id)) {
        return done(new Error('token_invalid'), {
            'message': 'Invalid token'
        });
    }

    redisConnection.get(id, function(err, reply) {
        if (err) {
            return done(err, {
                'message': err
            });
        }

        if (_.isNull(reply)) {
            return done(new Error('token_invalid'), {
                'message': 'Token doesn\'t exists, are you sure it hasn\'t expired or been revoked?'
            });
        } else {
            var data = JSON.parse(reply);
            debug('User data fetched from redis store for user: %s', data.username || data.name);
            if (_.isEqual(data.token, id)) {
                return updateExpiryInRedis(data, done);
            } else {
                return done(new Error('token_doesnt_exist'), {
                    'message': 'Token doesn\'t exists, login into the system so it can generate new token.'
                });
            }

        }

    });

};

/**
 * Verifies that the token supplied in the request is valid, by checking the redis store to see if it's stored there.
 *
 * @param req
 * @param res
 * @param next
 */
var verify = function(req, res, next) {

    debug('Verifying token');

    var token = fetch(req.headers);

    jsonwebtoken.verify(token, config.secret, function(err, decode) {

        if (err) {
            req.user = undefined;
            return next(new UnauthorizedAccessError('invalid_token'));
        }

        retrieve(token, function(err, data) {

            if (err) {
                req.user = undefined;
                return next(new UnauthorizedAccessError('invalid_token', data));
            }

            req.user = data;
            next();

        });

    });
};

/**
 * Expires the token, so the user can no longer gain access to the system, without logging in again or requesting new token
 *
 * @param headers
 * @returns {boolean}
 */
var expire = function(headers) {

    var token = fetch(headers);

    debug('Expiring token: %s', token);

    if (token !== null) {
        redisConnection.expire(token, 0);
    }

    return token !== null;

};

/**
 * Middleware for getting the token into the user
 *
 * @param req
 * @param res
 * @param next
 */
var middleware = function(req, res, next) {

    var token = fetch(req.headers);

    retrieve(token, function(err, data) {

        if (err) {
            req.user = undefined;
            return next(new UnauthorizedAccessError("invalid_token", data));
        } else {
            req.user = _.merge(req.user, data);
            next();
        }

    });
};

module.exports = {
    middleware: middleware,
    expire: expire,
    createToken: createToken
};

debug('Registering redis module');
