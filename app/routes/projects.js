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
var config = require('config');
var logger = require('../../common/logging.js').logger;
var yaml = require('js-yaml');
var crypto = require('crypto');
var urlParser = require('url');
var clone = require('clone');
var merge = require('merge');

module.exports = function(app, db, passport) {

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
                res.send(500);
            });
        }
    });
    app.get('/projects/:source/url/:url', function (req, res) {
        if (!req.params.source) {
            res.send(400, "Missing source parameter.");
            return;
        }
        if (!req.params.url) { res.send(400, "Missing url parameter."); return; }
        if (req.params.source != "GitHub") { res.send(400, "At this time, source must be GitHub."); return; }

        getGitHubRepoAndLabels(req.params.url, function (error, results) {
            results.source = req.params.source;
            results.url = req.params.url;
            res.set('Cache-Control', 'max-age=' + config.github.cacheMaxAge);
            res.send(results);
        }, function (error) {
            res.send(500);
        });
    });
}

var getProjectsFromArray = function (projectList, success, error) {
    async.concat(projectList, getProjects, function (err, results) {
        if (err) error(err);
        else {
            success(results);
        }
    });
}
module.exports.getProjectsFromArray = getProjectsFromArray;

function getProjects(project, callback) {

    if(project.type == "github") {
        getGitHubProject(project, callback);
    }
    else if (project.type == "github-file") {
        getGitHubFileProject(project, callback);
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

function getGitHubFileProject(ghConfig, callback) {
    options = {
        url: 'https://api.github.com/' + ghConfig.url + "?client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret,
        headers: {
            'User-Agent': config.github.clientApplicationName
        }
    };
    request(options, function (error, response, body) {
        if (!error &&
            typeof response !== 'undefined' &&
            response.statusCode == 200) {

            // parse out the yaml from content block
            var json = JSON.parse(body);
            var decodedContent = new Buffer(json.content, 'base64').toString('ascii');

            try {
                var resourcesYaml = yaml.safeLoad(decodedContent);

            } catch (error) {
                var message = 'Error while parsing yaml project file from: ' + options.url + '; message: ' + error.message;
                logger.error(message);
                return callback(message);
            }
            // remove extraneous info from result
            async.concat(resourcesYaml, parseGitHubFileResults, function (err, results) {
                return callback(err, results);
            });
        }
        else {
            logger.error('Error while fetching GitHub content: %s; response: %s; body: %s', error, response, body);
            return callback(error);
        }
    });
}

function parseGitHubFileResults(result, callback) {
    var transformed = {
        "title": result.title,
        "description": result.description,
        "source": result.source,
        "tags": [],
        "url": result.url
    };

    for (var i = 0; i < result.tags.length; i++) {
        transformed.tags[i] = { "display_name": result.tags[i]};
        transformed.tags[i].id = crypto.createHash('md5').update(result.tags[i]).digest("hex");
    }

    callback(null, transformed);
}


function getGitHubRepoAndLabels(fullRepoUrl, callback) {

    var path = urlParser.parse(fullRepoUrl).pathname;

    // Call both repo details and repo issues, merge once completes
    async.parallel([
        function (callback) {
            options = {
                url: 'https://api.github.com/repos' + path + "?client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret,
                headers: {
                    'User-Agent': config.github.clientApplicationName
                }
            }
            request(options, function (error, response, body) {
                if (!error &&
                    typeof response !== 'undefined' &&
                    response.statusCode == 200) {

                    var json = JSON.parse(body);

                    // remove extraneous info from result
                    var result = parseGitHubRepoResult(json);

                    // all done
                    callback(null, result);
                }
                else {
                    logger.error('Error while fetching GitHub repo: %s; response: %s; body: %s', error, response, body);
                    callback(error);
                }
            });
        },
        function (callback){
            // Get the label counts from issues
            options = { url: 'https://api.github.com/repos' + path + "/issues?client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret,
                headers: {
                    'User-Agent': config.github.clientApplicationName
                }};
            request(options, function (error, response, body) {
                if (!error &&
                    typeof response !== 'undefined' &&
                    response.statusCode == 200) {

                    var issuesJson = JSON.parse(body);

                    // remove extraneous info from result
                    var result = parseGitHubIssuesResult(issuesJson, fullRepoUrl);

                    return callback(null, result);

                } else {
                    logger.error('Error while fetching GitHub issues: %s; response: %s; body: %s', error, response, body);
                    callback(error);
                }
            });
        }],
        // Both results are in, merge first with second
        function(err, results){
            var result = merge.recursive(true, results[0], results[1]);
            callback(err, result);
        }
    );
}

function parseGitHubRepoResult (result) {

    var transformed = {
        "updated_at": result.updated_at,
        "backlog_count": result.open_issues_count
    };

    return transformed;
}

function parseGitHubIssuesResult(issues, fullRepoUrl) {
    var result = {"issues": clone(config.projectLabels)};
    for (var i = 0; i < result.issues.length; i++) {
        result.issues[i].count = 0;
        result.issues[i].url = fullRepoUrl + "/labels/" + encodeURIComponent(result.issues[i].name);
    }

    // Loop through each issue and
    // if its open and found in our config
    // count it up
    for (var i = 0; i < issues.length; i++) {
        if (issues[i].state == "open") {
            for (var j = 0; j < issues[i].labels.length; j++) {
                for (var k = 0; k < result.issues.length; k++) {
                    if (issues[i].labels[j].name == result.issues[k].name) {
                        result.issues[k].count++;
                    }
                }
            }
        }
    }
    return result;
}
