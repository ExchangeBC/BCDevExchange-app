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
var cluster = require('cluster');
var config = require('config');

// Test if cluster mode is enabled
if (config.node.clusterEnabled &&
    cluster.isMaster) {

    // Fork workers by config or # of CPUs if undefined
    var numCPUs = config.node.workers ||
        require('os').cpus().length;

    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // When a worker dies, log and restart
    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
        setTimeout(function () { cluster.fork(); }, 500);
    });

} else if (!config.node.clusterEnabled || !cluster.isMaster) {

    // Start working process
    var express = require('express');
    var helmet = require('helmet');
    var session = require('express-session');
    var MongoStore = require('connect-mongo')(session);
    var bodyParser = require('body-parser');
    var logger = require('./common/logging.js').logger;
    var passport = require('passport');
    var GitHubStrategy = require('passport-github2').Strategy;
    var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
    var async = require('async');

    // set up db connection
    var db = require('./app/models/db');

    console.log('NODE_ENV: ' + config.util.getEnv('NODE_ENV'));

    // Passport session setup
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    // use GitHubStrategy with Passport
    passport.use(new GitHubStrategy({
            clientID: (process.env.GH_CLIENT_ID || config.github.clientID),
            clientSecret: (process.env.GH_CLIENT_SECRET || config.github.clientSecret),
            callbackURL: config.github.callbackURL,
            passReqToCallback: true
        },
        function (req, accessToken, refreshToken, extProfile, done) {
            passportStrategySetup(req, accessToken, refreshToken, extProfile, done);
        }
    ));


    // use LinkedInStrategy with Passport
    passport.use(new LinkedInStrategy({
            clientID: (process.env.LI_CLIENT_ID || config.linkedin.clientID),
            clientSecret: (process.env.LI_CLIENT_SECRET || config.linkedin.clientSecret),
            callbackURL: config.linkedin.callbackURL,
            passReqToCallback: true,
            scope: ['r_fullprofile'],
            state: true
        }, function (req, accessToken, refreshToken, extProfile, done) {
            passportStrategySetup(req, accessToken, refreshToken, extProfile, done);
        }
    ));

    function passportStrategySetup(req, accessToken, refreshToken, extProfile, done) {

        if (!req.user) {
            // not logged in
            // look for existing account

            db.getAccountByIdentity(extProfile.id, true,
                function (err, account) {
                    if (err) {
                        logger.error(err);
                        return done(err, null);
                    }

                    if (account) {

                        for (var i = 0; i < account.identities.length; i++) {
                            if (account.identities[i].identifier === extProfile.id) {
                                account.identities[i].accessToken = accessToken;
                                account.identities[i].refreshToken = refreshToken;
                                break;
                            }
                        }

                        account.save(function (err) {
                            if (err) {
                                logger.error(err);
                                return done(err, null);
                            }

                            account.loggedInContext = extProfile.provider;
                            return done(null, account);
                        });

                    } else {
                        // create a new account
                        db.createAccount(extProfile, accessToken, refreshToken, function (err, updatedAcct) {
                            updatedAcct.loggedInContext = extProfile.provider;
                            return done(null, updatedAcct);
                        });
                    }

                });

        } else {
            // logged in
            // associate new identity to existing account
            // or merge identities if necessary

            var loggedInContext = req.user.loggedInContext;

            db.getAccountById(req.user._id, false,
                function (err, account) {
                    if (err) {
                        logger.error(err);
                        return done(err, null);
                    }

                    if (account) {

                        db.addIdentity(account, extProfile, accessToken, refreshToken, function (err, updatedAcct) {
                            updatedAcct.loggedInContext = loggedInContext;


                            // check if a different account exists associated to the identity the user just logged in with
                            db.getAccountByIdentity(extProfile.id, true,
                                function (err, otherAcct) {
                                    if (err) {
                                        logger.error(err);
                                        return done(err, null);
                                    }

                                    if (otherAcct && otherAcct.id != updatedAcct.id) {
                                        // need to remove this account object
                                        var profiles = otherAcct.profiles;
                                        otherAcct.remove(function (err, removedAcct) {
                                            if (err) {
                                                logger.error(err);
                                                return done(err, null);
                                            }

                                            async.each(profiles, function (profile, callback) {
                                                profile.remove(function (err, pr) {
                                                    if (err) {
                                                        callback(err);
                                                    }
                                                    callback();
                                                });
                                            }, function (err) {
                                                if (err) {
                                                    logger.error(err);
                                                    return done(err, null);
                                                }

                                                return done(null, updatedAcct);
                                            });

                                        })

                                    } else {
                                        // no account found
                                        return done(null, updatedAcct);
                                    }
                                });
                        });

                    } else {
                        // this shouldn't happen
                        // TODO return error
                    }
                });
        }
    }

    // Init express and put on our helmet (security protections)
    var app = express();
    app.use(helmet());
    app.set('port', (config.http.port || 5000));
    app.set('trust proxy', 1) // trust first proxy

    app.use(session({
        secret: config.http.session.secret,
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({url: config.mongodb.sessionStoreUrl}),
        cookie: config.http.cookieOptions
    }));

    // initialize passport and use passport.session() to support persistent login sessions
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(bodyParser.json());

    // ===== Static all files in public, only use locally as servers should use nginx =====
    if (config.http.serveStatic) {
        app.use(express.static(__dirname + '/public', {"maxage": config.http.static.maxage}));
    }

    // ====== routes ======
    require('./app/routes/auth')(app, db, passport);
    require('./app/routes/config')(app, db, passport);
    require('./app/routes/numbers')(app, db, passport);
    require('./app/routes/people')(app, db, passport);
    require('./app/routes/programs')(app, db, passport);
    require('./app/routes/projects')(app, db, passport);
    require('./app/routes/resources')(app, db, passport);

    app.listen(app.get('port'), function () {
        logger.info("Node app is running on port " + app.get('port'));
    });
}