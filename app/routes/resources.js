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
            res.send('');
        });

    });

    function getResourcesFromArray(resourceList, success, error) {
        async.concat(resourceList, getCatalogueItems, function (err, results) {
            if (err) error(err);
            else {
                success(results);
            }
        });
    }

    // Just gets items from CKAN v3 compatible APIs
    // TODO: refactor later, must get this done quick!
    function getCatalogueItems (catalogue, callback) {
        if (catalogue.type == "CKANv3") {
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
                else if (error) {
                    logger.error('Error while fetching %s content: %s; body: %s', catalogue.short_name, error, body);
                    callback(error);
                }
            });
        }
        else if (catalogue.type == "GitHub") {
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
                    callback(error);
                }
            });
        }
    }

    function parseGitHubResourceResults(result, callback) {
        var transformed = {
            "name": result.name,
            "title": result.name,
            "notes": result.description,
            "tags": "",
            "url": result.html_url,
            "record_last_modified": result.updated_at
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
                results[i].url = catalogue.baseViewUrl + results[i].name
            }
        }
    }

    // Filter out data that doesn't appear on the site
    function transformCKANResult (result, callback) {
        var transformed = {
            "title": result.title,
            "name": result.name,
            "notes": result.notes,
            "tags": result.tags,
            "record_last_modified": result.metadata_modified
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

    app.get('/resources-sources', function(req, res) {
        var listOfCatalogues = [];
        for (x in config.catalogues) {
            var catalogue = config.catalogues[x];
            listOfCatalogues.push({'name': catalogue.name, 'short_name': catalogue.short_name});
        }

        res.send({ "sources": listOfCatalogues });
    });

}
