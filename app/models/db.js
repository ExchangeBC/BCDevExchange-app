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
    Origin : models.Origin,
    getAccount : function(query, res) {
      models.Account.findOne(query)
          .populate('identities.origin profiles')
          .exec(function (err, output){
              if (err) {
                  logger.error(err);
              }
              res.json(output);
      });
    },
    createAccount : function (extProfile) {
        var origin = new models.Origin({
            name: extProfile.provider,
            miniIconUrl: ''
        });
        origin.save(function (err) {
            if (err) {
                logger.error(err);
            }
        });

        var profile = new models.Profile({
            type: 'Individual',
            name: {
                identityOrigin: extProfile.provider, // where this attribute originated from
                attributeName: 'displayName', // name of attribute from origin
                value: extProfile.displayName // denormalized value
            },
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
            }
        });

        var user = new models.Account({
            identities: [{
                origin: origin,
                identifier: extProfile.id, // User's identifier from origin
                attributes: []
            }],
            profiles: [profile]
        });
        user.save(function (err) {
            if (err) {
                logger.error(err);
            }
        });
    },
    addIdentity : function (account, extProfile) {
        var origin = new models.Origin({
            name: extProfile.provider,
            miniIconUrl: ''
        });
        origin.save(function (err) {
            if (err) {
                logger.error(err);
            }
        });

        account.identities.push(origin);
    }

};

