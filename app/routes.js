var request = require('request');

// simple route middleware to ensure user is authenticated
// use this route middleware on any resource that needs to be protected
// if the request is authenticated the request will proceed
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.sendStatus(401);
    }
}

function loginCallbackHandler(req, res, db, logger) {
    db.Profile.findById(req.user.profiles[0])
        .exec(function (err, profile){
            if (err) {
                logger.error(err);
                res.sendStatus(500);
            }

            if (profile) {
                res.cookie('user', JSON.stringify({
                    'displayName': profile.name.value
                }));
                res.redirect('/#/account?id=' + req.user.identities[0].identifier);
            }
        });
}

module.exports = function(app, config, logger, db, passport) {

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
            failureRedirect: '/#/login'
        }),
        function(req, res) {
            loginCallbackHandler(req, res, db, logger);
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
            loginCallbackHandler(req, res, db, logger);
        });

    // ===== logout routing ======

    app.post('/logout', function(req, res) {
        req.logOut();
        res.sendStatus(200);
    });

    // ===== account page routing ======

    app.get('/account/:id', ensureAuthenticated, function(req, res) {
        db.getAccount({'identities.identifier': req.params.id}, res);
    })

    app.post('/account/:id', ensureAuthenticated, function(req, res) {
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

    app.get('/resources', function(req, res) {
        request('http://' + config.bcdc.host + '/api/3/action/package_search?q=tags:' + config.bcdc.tagToSearch, function (error, response, body) {
            var resourcesJson = { 'resources': [] }
            if (!error && response.statusCode == 200) {
                var json = JSON.parse(body);
                resourcesJson['resources'] = json.result.results;
            }

            else if(error) {
                logger.info('Error while fetching BCDC content (error code %s): %s', response.statusCode, body);
            }

            res.send(resourcesJson);
        });
    });

}
