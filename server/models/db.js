/*
Copyright 2015 Province of British Columbia

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

'use strict'

var mongoose = require('mongoose')
var config = require('config')
var logger = require('../../common/logging.js').logger
var Q = require('q')
var _ = require('lodash')

var dbURI = config.mongodb.connectionString

mongoose.connect(dbURI)

mongoose.connection.on('connected', function () {
  logger.info("Mongoose default connection open to " + dbURI)
})

mongoose.connection.on('error', function (err) {
  logger.error("Mongoose default connection error: " + err)
})

mongoose.connection.on('disconnected', function () {
  logger.info("Mongoose default connection disconnected")
})

process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    logger.info("Mongoose default connection disconnected through app termination")
    process.exit(0)
  })
})


// bring in models
var models = require('./models')

exports.Account = models.account
exports.Profile = models.profile
exports.getAccountsByOrigin = function (origin, callback) {
  var query = models.account.find({
    'identities.origin': origin
  })
  query.populate('profiles')

  query.exec(function (err, output) {
    callback(err, output)
  })
}

exports.getAccountById = function (accountId, populateProfiles, callback) {
  var query = models.account.findById(accountId)

  if (populateProfiles) {
    query = query.populate('profiles')
  }

  query.exec(function (err, output) {
    callback(err, output)
  })
}

exports.getAccountByIdentity = function (identifier, populateProfiles, callback) {
  var query = models.account.findOne({
    'identities.identifier': identifier
  })

  if (populateProfiles) {
    query = query.populate('profiles')
  }

  query.exec(function (err, output) {
    callback(err, output)
  })
}

exports.createAccount = function (extProfile, accessToken, refreshToken, callback) {

  var profile = new models.profile({
    type: 'Individual',
    name: {},
    visible: true,
    contact: {
      email: {}
    },
    contactPreferences: {
      notifyMeOfAllUpdates: true
    }
  })

  profile.save(function (err) {
    if (err) {
      logger.error(err)
      callback(err, null)
    }

    var user = new models.account({
      identities: [{
        origin: extProfile.provider,
        identifier: extProfile.id, // User's identifier from origin
        accessToken: accessToken,
        refreshToken: refreshToken,
        attributes: []
                }],
      profiles: [profile]
    })
    user.save(function (err) {
      if (err) {
        logger.error(err)
        callback(err, null)
      }

      callback(null, user)
    })
  })

}

exports.addIdentity = function (account, extProfile, accessToken, refreshToken, callback) {
  account.identities.push({
    origin: extProfile.provider,
    identifier: extProfile.id,
    accessToken: accessToken,
    refreshToken: refreshToken
  })
  account.save(function (err) {
    if (err) {
      logger.error(err)
      callback(err, null)
    }

    callback(null, account)
  })

}

exports.countGitHubAccounts = function (callback) {
  models.account.count({
    'identities.origin': 'github'
  }, function (err, result) {
    callback(err, result)
  })
}

exports.countLinkedInAccounts = function (callback) {
  models.account.count({
    'identities.origin': 'linkedin'
  }, function (err, result) {
    callback(err, result)
  })
}

exports.countDualAccounts = function (callback) {
  // get all accounts which have a github AND linkedin identity
  models.account.where({
    $and: [{
      'identities.origin': 'github'
    }, {
      'identities.origin': 'linkedin'
    }]
  }).count(function (err, result) {
    callback(err, result)
  })
}

exports.getPrograms = function (cb) {
  var deferred = Q.defer()
  models.program.find().select('-_id -__v').lean().exec(function (err, res) {
    if(err) deferred.reject(err)
    else deferred.resolve(res)
  })
  return deferred.promise.nodeify(cb)
}

exports.getProgram = function (programId, cb) {
  var deferred = Q.defer()
  models.program.findOne({
    'id': programId
  }).select('-_id -__v').lean().exec(function (err, res) {
    if(err) deferred.reject(err)
    else deferred.resolve(res)
  })
  return deferred.promise.nodeify(cb)
}

exports.getProgramByName = function (programNm, cb) {
  var deferred = Q.defer()
  models.program.findOne({
    'name': programNm
  }).select('-_id -__v').lean().exec(function (err, res) {
    if(err) deferred.reject(err)
    else deferred.resolve(res)
  })
  return deferred.promise.nodeify(cb)
}

exports.createProgram = function (program, cb) {
  var deferred = Q.defer()
  program.id = require('node-uuid').v4()
  models.program.create(program, function (err, res) {
    if(err) deferred.reject(err)
    else deferred.resolve(res)
  })
  return deferred.promise.nodeify(cb)
}

exports.updateProgram = function (programId, programPatch, cb) {
  var deferred = Q.defer()
  exports.getProgram(programId).then(function(res){
    var updatedProgram = _.merge(res, programPatch)
    models.program.findOneAndUpdate({id: programId}, updatedProgram, function(err, res){
      if(err) deferred.reject(err)
      else deferred.resolve(res)
    })
  })
  return deferred.promise.nodeify(cb)
}

exports.deleteProgram = function (programId, cb) {}

exports.getNumber = function(query,cb){
  var deferred = Q.defer()
  models.number.findOne(query).lean().exec(function (err, res) {
    if(err) deferred.reject(err)
    else deferred.resolve(res)
  })
  return deferred.promise.nodeify(cb)
}

exports.updateNumber = function(id, doc, cb){
  var deferred = Q.defer()
  models.number.where({_id: id }).update(doc, function (err, res) {
    if(err) deferred.reject(err)
    else deferred.resolve(res)
  })
  return deferred.promise.nodeify(cb)
}