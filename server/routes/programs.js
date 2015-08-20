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

'use strict'
var async = require('async')
var request = require('request')
var config = require('config')
var logger = require('../../common/logging.js').logger
var yaml = require('js-yaml')
var crypto = require('crypto')
var clone = require('clone')
var merge = require('merge')

var getProgramsFromArray = function (programList, success, error) {
  async.concat(programList, getPrograms, function (err, results) {
    if (err) error(err)
    else {

      // filter out invisible
      var i = 0
      while (i < results.length) {
        var program = results[i]
        if (program.visible !== "yes" &&
          program.visible !== "y" &&
          program.visible !== "true") {

          // remove from result
          results.splice(i, 1)

          // decrement the counter
          i--
        }
        i++
      }
      success(results)
    }
  })
}

module.exports = function (app, db, passport) {

  app.get('/programs/', function (req, res) {

    getProgramsFromArray(config.programs, function (results) {
      var body = {
        "programs": results
      }
      res.send(body)
    }, function (error) {
      res.sendStatus(500)
    })
  })
  app.get('/programs/name/:title', function (req, res) {
    if (!req.params.title) {
      res.send(400, "Missing url title.")
      return
    }

    getProgramDetails(req.params.title, function (error, result) {
      if (error) {
        res.send(500)
      }
      res.send(result)
    })
  })
}

function getPrograms(program, callback) {

  if (program.type === "github-file") {
    getGitHubFileProgram(program, callback)
  } else {
    logger.error("Configuration error, unknown program type: " + program.type)
  }

}

function getGitHubFileProgram(ghConfig, callback) {
  var options = {
    url: 'https://api.github.com/' + ghConfig.url + "?client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret,
    headers: {
      'User-Agent': config.github.clientApplicationName
    }
  }
  request(options, function (error, response, body) {
    if (!error &&
      typeof response !== 'undefined' &&
      response.statusCode === 200) {

      // parse out the yaml from content block
      var json = JSON.parse(body)
      var decodedContent = new Buffer(json.content, 'base64').toString('ascii')
      var programYaml

      try {
        programYaml = yaml.safeLoad(decodedContent)

      } catch (requestError) {
        var message = 'Error while parsing yaml program file from: ' + options.url + '. message: ' + requestError.message
        logger.error(message)
        return callback(message)
      }
      // remove extraneous info from result
      async.concat(programYaml, parseGitHubFileResults, function (err, results) {
        return callback(err, results)
      })
    } else {
      logger.error('Error while fetching GitHub content: %s. response: %s. body: %s', error, response, body)
      return callback(error)
    }
  })
}

function parseGitHubFileResults(result, callback) {
  var transformed = {
    "title": result.title,
    "description": result.description,
    "owner": result.owner,
    "logo": result.logo,
    "tags": [],
    "url": result.url,
    "id": result.id,
    "visible": result.visible
  }

  if (result.tags) {
    var i = 0
    while (i < result.tags.length) {
      transformed.tags[i] = {
        "display_name": result.tags[i]
      }
      transformed.tags[i].id = crypto.createHash('md5').update(result.tags[i]).digest("hex")
      i++
    }
  }
  return callback(null, transformed)

}

function getProgramDetails(title, callback) {

  // First get the directory to figure out what repo it is
  getGitHubFileProgram(config.programs[0], function (error, result) {
    if (error) {
      logger.error('Error while fetching GitHub content: %s', error)
      return callback(error)
    }

    // find entry in the result
    var program
    for (var k in result) {
      if (result[k].title.toUpperCase() === title.toUpperCase()) {
        program = result[k]
        break
      }
    }
    if (!program) {
      logger.error('Could not find title: %s in directory', title)
      return callback("Bad config")
    }
    if (!program.url) {
      logger.error('Could not find title: %s in directory', title)
      return callback("Bad config")
    }

    // Call github for file contents
    var options = {
      url: 'https://api.github.com/repos/' + program.url + "?client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret,
      headers: {
        'User-Agent': config.github.clientApplicationName
      }
    }
    request(options, function (error, response, body) {
      if (!error &&
        typeof response !== 'undefined' &&
        response.statusCode === 200) {

        // parse out the yaml from content block
        var json = JSON.parse(body)
        var decodedContent = new Buffer(json.content, 'base64').toString('ascii')

        var result = {
          "markdown": decodedContent
        }

        return callback(null, result)

      } else {
        logger.error('Error while fetching GitHub content: %s. response: %s. body: %s', error, response, body)
        return callback(error)
      }
    })
  })
}
