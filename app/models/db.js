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

var mongoose = require('mongoose');
var config = require('config');
var logger = require('../../common/logging.js').logger;

var dbURI = config.mongodb.connectionString;

mongoose.connect(dbURI);

mongoose.connection.on('connected', function() {
    logger.info("Mongoose default connection open to " + dbURI);
});

mongoose.connection.on('error', function(err) {
    logger.error("Mongoose default connection error: " + err);
});

mongoose.connection.on('disconnected', function() {
    logger.info("Mongoose default connection disconnected");
});

process.on('SIGINT', function() {
    mongoose.connection.close(function() {
        logger.info("Mongoose default connection disconnected through app termination");
        process.exit(0);
    });
});


// bring in models
var models = require('./models');

module.exports = {
    Account : models.Account,
    Profile : models.Profile,
    getAccountById : function(accountId, populateProfiles, callback) {
        var query = models.Account.findById(accountId);

        if (populateProfiles) {
            query = query.populate('profiles');
        }

        query.exec(function (err, output) {
            callback(err, output);
        });
    },
    getAccountByIdentity : function(identifier, populateProfiles, callback) {
        var query = models.Account.findOne({'identities.identifier': identifier});

        if (populateProfiles) {
            query = query.populate('profiles');
        }

        query.exec(function (err, output) {
            callback(err, output);
        });
    },
    createAccount : function (extProfile, accessToken, refreshToken, callback) {

        var profile = new models.Profile({
            type: 'Individual',
            name: {},
            visible: true,
            contact: {
                email: {}
            },
            contactPreferences: {
                notifyMeOfAllUpdates: true
            }
        });

        profile.save(function (err) {
            if (err) {
                logger.error(err);
                callback(err, null);
            }

            var user = new models.Account({
                identities: [{
                    origin: extProfile.provider,
                    identifier: extProfile.id, // User's identifier from origin
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    attributes: []
                }],
                profiles: [profile]
            });
            user.save(function (err) {
                if (err) {
                    logger.error(err);
                    callback(err, null);
                }

                callback(null, user);
            });
        });

    },
    addIdentity : function (account, extProfile, accessToken, refreshToken, callback) {

        account.identities.push({origin: extProfile.provider, identifier: extProfile.id, accessToken: accessToken, refreshToken: refreshToken});
        account.save(function(err) {
            if (err) {
                logger.error(err);
                callback(err, null);
            }

            callback(null, account);
        });

    },
    countGitHubAccounts : function (callback) {
        models.Account.count({ 'identities.origin' : 'github' }, function(err, result) {
            callback(err, { "githubAccounts" : result });
        });
    },
    countLinkedInAccounts : function (callback) {
        models.Account.count({ 'identities.origin' : 'linkedin' }, function(err, result) {
            callback(err, result);
        });
    },
    countDualAccounts : function (callback) {
        // get all accounts which have a github AND linkedin identity
        models.Account.where({ $and : [{ 'identities.origin' : 'github' }, { 'identities.origin' : 'linkedin' }]}).count(function(err, result) {
            callback(err, result);
        });
    }

};

