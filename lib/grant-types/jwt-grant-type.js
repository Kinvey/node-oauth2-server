'use strict';

/**
 * Module dependencies.
 */

var AbstractGrantType = require('./abstract-grant-type');
var InvalidArgumentError = require('../errors/invalid-argument-error');
var InvalidGrantError = require('../errors/invalid-grant-error');
var InvalidRequestError = require('../errors/invalid-request-error');
var Promise = require('bluebird');
var promisify = require('promisify-any').use(Promise);
var util = require('util');

/**
 * Constructor.
 */

function JWTGrantType(options) {
  options = options || {};

  if (!options.model) {
    throw new InvalidArgumentError('Missing parameter: `model`');
  }

  if (!options.model.getToken) {
    throw new InvalidArgumentError('Invalid argument: model does not implement `getToken()`');
  }

  AbstractGrantType.call(this, options);
}

/**
 * Inherit prototype.
 */

util.inherits(JWTGrantType, AbstractGrantType);

/**
 * Retrieve the user from the model using a username/password combination.
 *
 * @see https://tools.ietf.org/html/rfc6749#section-4.3.2
 */

JWTGrantType.prototype.handle = function(request, client) {
  if (!request) {
    throw new InvalidArgumentError('Missing parameter: `request`');
  }

  if (!client) {
    throw new InvalidArgumentError('Missing parameter: `client`');
  }

  var scope = this.getScope(request);

  return Promise.bind(this)
    .then(function() {
      return this.getToken(request, client);
    });
};

/**
 * Get user using a username/password combination.
 */

JWTGrantType.prototype.getToken = function(request, client) {
  return promisify(this.model.getToken, 2).call(this.model, request, client)
    .then(function(user) {
      if (!user) {
        throw new InvalidGrantError('Invalid grant: token is invalid');
      }

      return user;
    });
};

/**
 * Export constructor.
 */

module.exports = JWTGrantType;
