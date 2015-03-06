var express = require('express');
var helmet = require('helmet');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var logger = require('./common/logging.js').logger;
var config = require('config');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;


// set up db connection
var db = require('./app/models/db');

// Passport session setup
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// use GitHubStrategy with Passport
passport.use(new GitHubStrategy({
        clientID: (process.env.GH_CLIENT_ID || config.github.clientID),
        clientSecret: (process.env.GH_CLIENT_SECRET || config.github.clientSecret),
        callbackURL: config.github.callbackURL
    },
    function(accessToken, refreshToken, extProfile, done) {
        passportStrategySetup(extProfile, done);
    }
));


// use LinkedInStrategy with Passport
passport.use(new LinkedInStrategy({
    clientID: (process.env.LI_CLIENT_ID || config.linkedin.clientID),
    clientSecret: (process.env.LI_CLIENT_SECRET || config.linkedin.clientSecret),
    callbackURL: config.linkedin.callbackURL,
    scope: ['r_fullprofile'],
    state: true
}, function(accessToken, refreshToken, extProfile, done) {
        passportStrategySetup(extProfile, done);
    }
));

function passportStrategySetup(extProfile, done) {
    logger.info("logged in as " + extProfile.displayName + " from " + extProfile.provider);

    db.Account.findOne({'identities.identifier': extProfile.id})
        .populate('identities.origin profiles')
        .exec(function (err, account){
            if (err) {
                logger.error(err);
            }

            if (account) {
                var originExists = false;
                for (var i = 0; i < account.identities.length; i++) {
                    if (account.identities[i].origin.name == extProfile.provider) {
                        originExists = true;
                        break;
                    }
                }

                if (!originExists) {
                    db.addIdentity(account, extProfile, function (err, updatedAcct) {
                        return done(null, updatedAcct);
                    });
                }
                else {
                    return done(null, account);
                }

            } else {

                db.createAccount(extProfile, function (err, updatedAcct) {
                    return done(null, updatedAcct);
                });

            }

        });
}

// Init express and put on our helmet (security protections)
var app = express();
app.use(helmet());

app.set('port', (config.http.port || 5000));

app.use(session({
    secret: config.http.session.secret,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ url: config.mongodb.sessionStoreUrl })
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
require('./app/routes')(app, config, logger, db, passport);

app.listen(app.get('port'), function() {
    logger.info("Node app is running on port " + app.get('port'));
});