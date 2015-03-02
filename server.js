var express = require('express');
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

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// use GitHubStrategy with Passport
passport.use(new GitHubStrategy({
        clientID: (process.env.GH_CLIENT_ID || config.github.clientID),
        clientSecret: (process.env.GH_CLIENT_SECRET || config.github.clientSecret),
        callbackURL: config.github.callbackURL
    },
    function(accessToken, refreshToken, extProfile, done) {
        // asynchronous verification
        process.nextTick(function () {
            // return the user's GitHub profile to represent the logged-in user
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
                            db.addIdentity(account, extProfile);
                        }

                    } else {

                        db.createAccount(extProfile);

                    }

                    return done(null, extProfile);

                });

        });
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
        // asynchronous verification
        process.nextTick(function () {
            // return the user's LinkedIn profile to represent the logged-in user
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
                            db.addIdentity(account, extProfile);
                        }

                    } else {

                        db.createAccount(extProfile);

                    }

                    return done(null, extProfile);

                });

        });
    }
));

var app = express();

app.set('port', (config.http.port || 5000));


// initialize passport and use passport.session() to support persistent login sessions
app.use(passport.initialize());
//app.use(passport.session());
app.use(session({
    secret: config.http.session.secret,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ url: config.mongodb.sessionStoreUrl })
}));

app.use(bodyParser.json());

// ===== Static file for all files in public =====
app.use(express.static(__dirname + '/public', {"maxage": config.http.static.maxage}));

// ===== Low level conf for client side ======
app.get("/config",
    function (req, res) {
        res.send(config.ui);
    }
);

// ===== authentication page routing ======

// GET /auth/github
// use passport.authenticate() as route middleware to authenticate the request
app.get('/auth/github',
    passport.authenticate('github'),
    function(req, res) {
    //the request will be redirected to github for auth, so this function will not be called
});

// GET /auth/github/callback
// use passport.authenticate() as route middleware to authenticate the request
// if auth fails, the user will be redirected back to the login page
// otherwise, the primary route function will be called which will redirect the user to the home page
app.get('/auth/github/callback',
    passport.authenticate('github', {
        scope: ['user', 'repo'],
        failureRedirect: '/login'
    }),
    function(req, res) {
        res.redirect('/#/account?id=' + req.user.id);
    });


// GET /auth/linkedin
// use passport.authenticate() as route middleware to authenticate the request
app.get('/auth/linkedin',
    passport.authenticate('linkedin'),
    function(req, res) {
        //the request will be redirected to linkedin for auth, so this function will not be called
    });

// GET /auth/linkedin/callback
// use passport.authenticate() as route middleware to authenticate the request
// if auth fails, the user will be redirected back to the login page
// otherwise, the primary route function will be called which will redirect the user to the home page
app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', {
        failureRedirect: '/#/login'
    }),
    function(req, res) {
        res.redirect('/#/account?id=' + req.user.id);
    });



app.get('/account/:id', function(req, res) {
    db.getAccount({'identities.identifier': req.params.id}, res);
})

app.post('/account/:id', function(req, res) {
    var acctData = req.body;

    db.Account.findById(acctData._id)
        .populate('identities.origin profiles')
        .exec(function (err, account) {
            if (err) {
                logger.error(err);
            }

            if (account) {
                account.profiles[0].visible = acctData.profiles[0].visible;
                account.profiles[0].contactPreferences.notifyMeOfAllUpdates = acctData.profiles[0].contactPreferences.notifyMeOfAllUpdates;
                account.profiles[0].save(function (err) {
                    if (err) {
                        logger.error(err);
                    }

                    res.json(account);

                });
            }
        });


});



app.listen(app.get('port'), function() {
    logger.info("Node app is running on port " + app.get('port'));
});


// simple route middleware to ensure user is authenticated
// use this route middleware on any resource that needs to be protected
// if the request is authenticated the request will proceed
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}