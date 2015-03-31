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

    app.get('/projects/:source?', function (req, res) {
        if (req.params.length > 0) {
            // Handle specific requests
        }
        else {
            getProjectsFromArray(config.projects, function (results) {
                var body = {"projects": results};
                res.set('Cache-Control', 'max-age=' + config.github.cacheMaxAge);
                res.send(body);
            }, function (error) {

            });
        }
    });

    function getProjectsFromArray(projectList, success, error) {
        async.concat(projectList, getProjects, function (err, results) {
            if (err) error(err);
            else {
                success(results);
            }
        });
    }

    function getProjects(project, callback) {

        if (project.type == "github") {
            getGitHubProject(project, callback);
        }

    }

    function getGitHubProject(ghConfig, callback) {
        options = {
            url: 'https://api.github.com/' + ghConfig.url + '?q="' + ghConfig.tag + '"+in:' + ghConfig.file + "&client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret,
            headers: {
                'User-Agent': config.github.clientApplicationName
            }
        };
        request(options, function (error, response, body) {
            if (!error &&
                typeof response !== 'undefined' &&
                response.statusCode == 200) {

                var json = JSON.parse(body);

                // remove extraneous info from result
                async.concat(json.items, parseGitHubResults, function (err, results) {
                    callback(err, results);
                });
            }
            else {
                logger.error('Error while fetching GitHub content: %s; response: %s; body: %s', error, response, body);
                callback(error);
            }
        });
    }

    function parseGitHubResults(result, callback) {
        var transformed = {
            "name": result.name,
            "description": result.description,
            "url": result.html_url,
            "homepage": result.homepage,
            "backlog_url": result.html_url + '/issues',
            "backlog_count": result.open_issues_count,
            "updated_at": result.updated_at
        };
        callback(null, transformed);
    }
}