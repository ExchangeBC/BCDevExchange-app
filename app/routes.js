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
var async = require('async');
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

function loginCallbackHandler(req, res, logger) {

    res.cookie('user', JSON.stringify({
        'loggedIn': true
    }));

    var identifier = '';
    for( var i = 0; i < req.user.identities.length; i++ ) {
        if ( req.user.identities[i].origin === req.user.loggedInContext ) {
            identifier = req.user.identities[i].identifier;
            break;
        }
    }

    res.redirect('/#/account?id=' + identifier);

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
            loginCallbackHandler(req, res, logger);
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
            loginCallbackHandler(req, res, logger);
        });

    // ===== logout routing ======

    app.post('/logout', function(req, res) {
        req.logOut();
        req.session.destroy();
        res.sendStatus(200);
    });

    // ===== account page routing ======

    app.get('/account/:id', ensureAuthenticated, function(req, res) {

        db.getAccountByIdentity(req.params.id, true,
            function (err, account){
                if (err) {
                    logger.error(err);
                    res.sendStatus(500);
                }

                var options = {};
                var authContext = req.user.loggedInContext;
                if (authContext == config.github.name) {
                    options = {
                        url: config.github.baseURL + '/user',
                        headers: {
                            'User-Agent': config.github.clientApplicationName
                        }
                    };
                } else if (authContext == config.linkedin.name) {
                    baseURL = config.linkedin.baseURL;
                    appName = config.linkedin.clientApplicationName;

                    options = {
                        url: config.linkedin.baseURL + '/people/~:(id,formatted-name)',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-li-format': 'json'
                        }
                    };
                }

                var accessToken = "";
                for( var i = 0; i < req.user.identities.length; i++ ) {
                    if ( req.user.identities[i].identifier === req.params.id ) {
                        accessToken = req.user.identities[i].accessToken;
                        break;
                    }
                }

                request(options, function (error, response, body) {
                    if (!error &&
                        typeof response !== 'undefined' &&
                        response.statusCode == 200) {

                        var json = JSON.parse(body);

                        // fill in details that aren't stored on our side
                        if (authContext == config.github.name) {
                            account.profiles[0].name = {
                                identityOrigin: authContext,
                                attributeName: 'name',
                                value: json.name
                            };
                        } else if (authContext == config.linkedin.name) {
                            account.profiles[0].name = {
                                identityOrigin: authContext,
                                attributeName: 'name',
                                value: json.formattedName
                            };
                        }

                        res.send(account);
                    }
                    else if(error) {
                        logger.error('Error while fetching user info', error, body);
                        res.sendStatus(500);
                    }
                }).auth(null, null, true, accessToken);

            });
    });

    app.post('/account/:id', ensureAuthenticated, function(req, res) {
        var acctData = req.body;

        db.getAccountById(acctData._id, true,
            function (err, account) {
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

    app.get('/numbers/accounts', function(req, res) {

        async.parallel([
            function(callback) {
                db.countGitHubAccounts(callback);
            },
            function(callback) {
                db.countLinkedInAccounts(callback);
            },
            function(callback) {
                db.countDualAccounts(callback);
            }
        ], function(err, results) {
            res.json(results);
        });
    });

    app.get('/projects/:source?', function(req, res) {
        if(req.params.length > 0) {
            // Handle specific requests
        }
        else {
            async.concat(config.projects, getProjects, function (err, results) {
                if (err) res.sendStatus(500);
                else {
                    var body = {"projects": results};
                    res.send(body);
                }
            });
        }
/*
        res.send({"projects": [
            {
                "title": "The BCDevExchange Project",
                "notes": "The BCDevExchange website is the public facing site for the BC Developers' Exchange - an experiment in tech innovation and collaboration.",
                "tags": [
                    {
                        "id": "11dd43",
                        "display_name": "Delivery"
                    },
                    {
                        "id": "88ae44",
                        "display_name": "Discovery"
                    },
                    {
                        "id": "44de23",
                        "display_name": "Research"
                    }
                ],
                "record_last_modified": "2015-03-12",
                "originName": "GitHub",
                "repoURL": "https://github.com/BCDevExchange/BCDevExchange-app"
            },
            {
                "title": "Geocoder Enhancements",
                "notes": "We've been exploring some new ideas to help enhance the Geocoder functionality. Come weigh in on the discussion, and let us know what features you'd like to see next. Opportunities for development contributions and collaboration.",
                "tags": [
                    {
                        "id": "ff32dd",
                        "display_name": "Research"
                    },
                    {
                        "id": "c344ee",
                        "display_name": "Rapid Adoption"
                    }
                ],
                "record_last_modified": "2015-03-11",
                "originName": "GitHub",
                "repoURL": "https://github.com/Geocoder/Geocoder"
            }
        ]});
*/
    });

    function getProjects(project, callback) {

        if(project.type == "github") {
            getGitHubProject(project, callback);
        }

    }

    function getGitHubProject(ghConfig, callback) {
        request('https://api.github.com/' + ghConfig.url + '?q=' + ghConfig.tag + "+in:" + ghConfig.file, function (error, response, body) {
            if (!error &&
                typeof response !== 'undefined' &&
                response.statusCode == 200) {

                var json = JSON.parse(body);
                callback(null, json);
            }
            else if(error) {
                logger.error('Error while fetching GitHub content: %s; body: %s', error, body);
                callback(error);
            }
        });
    }

    app.get('/people', function(req, res) {

        res.send({"people": [
            {
                "title": "Jane the Developer",
                "notes": "Jane is a developer with a focus on object-oriented custom implementation solutions. She brings a strong attention " +
                "to detail and quality to her work, and excels at rapidly learning new systems and technologies and translating that knowledge into " +
                "results. Jane is a team player with solid interpersonal skills and is able to build strong working relationships to achieve common goals.",
                "tags": [
                    {
                        "id": "22dd43",
                        "display_name": "Java"
                    },
                    {
                        "id": "33ae44",
                        "display_name": "Software Development"
                    },
                    {
                        "id": "ccde23",
                        "display_name": "Agile Methodologies"
                    },
                    {
                        "id": "77edaa",
                        "display_name": "JUnit"
                    }
                ],
                "record_last_modified": "2015-03-08",
                "originName": "LinkedIn",
                "repoURL": "",
                "profileURL": ""
            },
            {
                "title": "Dave the Developer",
                "notes": "Full stack Ruby/Rails developer with experience in e-commerce, social networking, and event management.",
                "tags": [
                    {
                        "id": "dd5623",
                        "display_name": "Git"
                    },
                    {
                        "id": "aa32ac",
                        "display_name": "Amazon EC2"
                    },
                    {
                        "id": "ff33ee",
                        "display_name": "Ruby on Rails"
                    },
                    {
                        "id": "bb44ed",
                        "display_name": "jQuery"
                    }
                ],
                "record_last_modified": "2015-03-04",
                "originName": "LinkedIn",
                "repoURL": "",
                "profileURL": ""
            }
        ]});

    });

    app.get('/resources', function(req, res) {
        async.concat(config.catalogues, getCatalogueItems, function (err, results) {
            if (err) res.sendStatus(500);
            else {
                var body = {"resources": results};
                res.send(body);
            }
        });
    });

    // Just gets items from CKAN v3 compatible APIs
    function getCatalogueItems (catalogue, callback) {
        request(catalogue.baseUrl + '/action/package_search?q=tags:' + catalogue.tagToSearch, function (error, response, body) {
            if (!error &&
                typeof response !== 'undefined' &&
                response.statusCode == 200) {

                var json = JSON.parse(body);

                // remove extraneous info from result
                async.concat(json.result.results, transformCKANResult, function (err, results) {
                    copyCatalogue(catalogue, results);
                    callback(err, results);
                });
            }
            else if(error) {
                logger.error('Error while fetching BCDC content: %s; body: %s', error, body);
                callback(error);
            }
        });
    }

    function copyCatalogue (catalogue, results) {
        for (var i = 0; i < results.length; i++) {
            results[i].catalogue = {"name": catalogue.name,
                "acronym": catalogue.acronym};
        }
    }

    // Filter out data that doesn't appear on the site
    function transformCKANResult (result, callback) {
        var transformed = {
            "title": result.title,
            "name": result.name,
            "notes": result.notes,
            "tags": result.tags,
            "record_last_modified": result.record_last_modified,
            "resources": result.resources
        };

        // trim the tags
        async.concat(result.tags, function(item, tagsCallback) {
           tagsCallback(null, {"display_name": item.display_name,
                "id": item.id})},
           function (error, results) {
                transformed.tags = results;
           });

        // trim the resources
        async.concat(result.resources, function(item, resourceCallback) {
            resourceCallback(null, {"name": item.name,
                "url": item.url})},
            function (error, results) {
                transformed.resources = results;
            });

        callback(null, transformed);
    }
}
