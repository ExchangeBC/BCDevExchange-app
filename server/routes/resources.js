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

module.exports = function(app, db, passport) {

    app.get('/resources/:source?', function(req, res) {
        var resourceList = [];

        // Only get resources from a source type or specific source
        // e.g. /resources/ckanv3 returns ALL ckanv3 resources,
        //      /resources/bcdrc returns just the BCDRC resource
        if(req.params.source) {
            var source = req.params.source;
            for(var i in config.catalogues) {
                var resource = config.catalogues[i];
                if(source == resource.type.toLowerCase() || source == resource.short_name.toLowerCase()) {
                    resourceList.push(resource);
                }
            }
        } else {
            // Let's just grab 'em all
            resourceList = config.catalogues;
        }

        getResourcesFromArray(resourceList, function(result) {
            var resources = { "resources": result };
            res.send(resources);
        }, function(error) {
            res.status(500);
            res.send(error);
        });

    });

    app.get('/resources-sources', function(req, res) {
        var listOfCatalogues = [];
        for (var x in config.catalogues) {
            var catalogue = config.catalogues[x];
            listOfCatalogues.push({'name': catalogue.name, 'url': '/resources/' + catalogue.short_name.toLowerCase(), 'short_name': catalogue.short_name});
        }

        res.send({ "sources": listOfCatalogues });
    });

    app.get('/resources/:source/url/:url', function (req, res) {
        if (!req.params.source) {
            res.send(400, "Missing source parameter.");
            return;
        }
        if (!req.params.url) { res.send(400, "Missing url parameter."); return; }
        if (req.params.source != "GitHub") { res.send(400, "At this time, source must be GitHub."); return; }

        getGitHubRepo(req.params.url, function (error, results) {
            results.source = req.params.source;
            results.url = req.params.url;
            res.set('Cache-Control', 'max-age=' + config.github.cacheMaxAge);
            res.send(results);
        }, function (error) {
            res.send(500);
        });
    });
};

var getResourcesFromArray = function (resourceList, success, error) {
    async.concat(resourceList, getCatalogueItems, function (err, results) {
        if (err) error(err);
        else {
            success(results);
        }
    });
};

module.exports.getResourcesFromArray = getResourcesFromArray;

// Just gets items from CKAN v3 compatible APIs
function getCatalogueItems (catalogue, callback) {
    if (catalogue.type == "CKANv3") {
        getCKANCatalogueItems(catalogue, function (err, results) {
            callback(err, results);
        });
    }
    else if (catalogue.type == "GitHub") {
        getGitHubCatalogueItems(catalogue, function (err, results) {
            callback(err, results);
        });
    }
    else if (catalogue.type == "GitHub-File") {
        getGitHubFileCatalogueItems(catalogue, function (err, results) {
            callback(err, results);
        });
    }
}

function getGitHubFileCatalogueItems (catalogue, callback) {
    options = {
        url: 'https://api.github.com/' + catalogue.url + "?client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret,
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
            var resourcesYaml;

            try {
                resourcesYaml = yaml.safeLoad(decodedContent);

            } catch (errorRequest) {
                var message = 'Error while parsing yaml project file from: ' + options.url + '; message: ' + errorRequest.message;
                logger.error(message);
                return callback(message);
            }
            // remove extraneous info from result
            async.concat(resourcesYaml, parseGitHubFileResults, function (err, results) {
                copyCatalogue(catalogue, results);
                return callback(err, results);
            });
        }
        else {
            logger.error('Error while fetching GitHub content: %s; response: %s; body: %s', error, response, body);
            callback({ 'error': error.toString() });
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
        transformed.tags[i].colour = crypto.createHash('md5').update(result.tags[i]).digest("hex").substring(0, 6);
    }

    callback(null, transformed);
}

function getGitHubCatalogueItems (catalogue, callback) {
    options = {
        url: 'https://api.github.com/search/repositories?q="' + catalogue.tagToSearch + '"+in:readme&client_id=' + config.github.clientID + "&client_secret=" + config.github.clientSecret,
        headers: {
            'User-Agent': config.github.clientApplicationName
        }
    };
    request(options, function (error, response, body) {
        if (!error &&
            typeof response !== 'undefined' &&
            response.statusCode == 200) {

            var json = JSON.parse(body);
            response.resume();

            // remove extraneous info from result
            async.concat(json.items, parseGitHubResourceResults, function (err, results) {
                copyCatalogue(catalogue, results);
                callback(err, results);
            });
        }
        else {
            logger.error('Error while fetching GitHub content: %s; response: %s; body: %s', error, response, body);
            callback({'error': error.toString()});
        }
    });
}

function getCKANCatalogueItems (catalogue, callback) {
    request(catalogue.baseUrl + '/action/package_search?q=' + catalogue.tagName + ':' + catalogue.tagValue + '&rows=200', function (error, response, body) {
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
        else if (error) {
            logger.error('Error while fetching %s content: %s; body: %s', catalogue.short_name, error, body);
            callback({'error': error.toString()});
        }
    });
}

function parseGitHubResourceResults(result, callback) {
    var transformed = {
        "title": result.name,
        "description": result.description,
        "tags": "",
        "url": result.html_url,
        "updated_at": result.updated_at
    };
    callback(null, transformed);
}

function copyCatalogue (catalogue, results) {
    for (var i = 0; i < results.length; i++) {
        results[i].catalogue = {"name": catalogue.name,
            "short_name": catalogue.short_name,
            "tagToSearch": catalogue.tagToSearch
        };
        if (!results[i].url) {
            results[i].url = catalogue.baseViewUrl + results[i].name;
        }
    }
}

// Filter out data that doesn't appear on the site
function transformCKANResult (result, callback) {
    var transformed = {
        "name": result.name,
        "title": result.title,
        "description": result.notes,
        "tags": result.tags,
        "updated_at": result.metadata_modified
    };

    // trim the tags
    async.concat(result.tags, function(item, tagsCallback) {
            tagsCallback(null, {
                "display_name": item.display_name,
                "colour": crypto.createHash('md5').update(item.display_name).digest("hex").substring(0, 6)
            });
        },
        function (error, results) {
            transformed.tags = results;
        });

    // trim the resources
    async.concat(result.resources, function(item, resourceCallback) {
            resourceCallback(null, {
                "name": item.name,
                "url": item.url
            });
        },
        function (error, results) {
            transformed.resources = results;
        });

    callback(null, transformed);
}


function getGitHubRepo(fullRepoUrl, callback) {

    var path = urlParser.parse(fullRepoUrl).pathname;

    options = {
        url: 'https://api.github.com/repos' + path + "?client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret,
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
            var result = parseGitHubRepoResult(json);

            // all done
            callback(null, result);
        }
        else {
            logger.error('Error while fetching GitHub repo: %s; response: %s; body: %s', error, response, body);
            callback({'error': error.toString()});
        }
    });
}

function parseGitHubRepoResult (result) {

    var transformed = {
        "updated_at": result.updated_at
    };

    return transformed;
}
