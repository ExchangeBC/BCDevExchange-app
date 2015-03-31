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

module.exports = function(app, config, logger, db, passport) {
    app.get('/numbers/:source?', function (req, res) {

        if (req.params.source) {
            if (req.params.source == 'resources') {
                getResourcesFromArray(config.catalogues, function (result) {
                    res.send({"resources": result.length});
                }, function (error) {
                    res.status(500);
                });
            }
            else if (req.params.source == 'projects') {
                getProjectsFromArray(config.projects, function (result) {
                    res.send({"projects": result.length});
                }, function (error) {
                    res.status(500);
                });
            }
            else if (req.params.source == 'accounts') {
                db.countGitHubAccounts(function (err, result) {
                    if (err) {
                        res.status(500)
                    }
                    else {
                        res.send(result);
                    }
                });
            }

        }
        else {
            async.parallel([
                function (callback) {
                    db.countGitHubAccounts(callback);
                },

                function (callback) {
                    getResourcesFromArray(config.catalogues, function (result) {
                        callback(null, {"resources": result.length});
                    }, function (error) {
                        callback(error, null);
                    });
                },
                function (callback) {
                    getProjectsFromArray(config.projects, function (result) {
                        callback(null, {"projects": result.length});
                    }, function (error) {
                        callback(error, null);
                    });
                }/*,
                 function(callback) {
                 db.countLinkedInAccounts(callback);
                 },
                 function(callback) {
                 db.countDualAccounts(callback);
                 }*/
            ], function (err, results) {
                console.log(results);
                res.send(results);
            });
        }
    });
}