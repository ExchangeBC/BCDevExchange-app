var mongoose = require('mongoose');
var config = require('config');
var logger = require('../../common/logging.js').logger;

var dbURI = config.mongodb.connectionString;

mongoose.connect(dbURI);

mongoose.connection.on('connected', function() {
    logger.info("Mongoose default connection open to " + dbURI);
});

mongoose.connection.on('error', function(err) {
    logger.info("Mongoose default connection error: " + err);
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


// TODO bring in schemas and models



