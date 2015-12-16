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
var crypto = require('crypto')
var yaml = require('js-yaml')
var config = require('config')
var Q = require('q')
var _ = require('lodash')


function getProgramsFromArray(programList, success, error) {
  async.concat(programList, getPrograms, function (err, results) {
    if (err)
      error(err)
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

function getProgramDetails(progData, callback) {

  var deferred = Q.defer()
  // Call github for stats
  var githubStatsUrl = progData.githubStatsUrl || progData.githubUrl
  if (!githubStatsUrl) {
    setTimeout(function () {
      deferred.resolve({})
    }, 0)
    return deferred.promise.nodeify(callback)
  }

  var getGitHubStats = function (item, cb) {
    console.log("getting github stats: ", item, githubStatsUrl)
    var ghRepo = githubStatsUrl.substr(githubStatsUrl.indexOf('github.com') + 11)
    var options = {
      url: 'https://api.github.com/repos/' + ghRepo + item + "?client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret,
      headers: {
        'User-Agent': config.github.clientApplicationName
      }
    }
    request(options, function (error, response, body) {
      if (!error &&
        typeof response !== 'undefined' &&
        response.statusCode === 200) {
        return cb(null, body)
      } else {
        logger.error('Error fetching GitHub content for %s: %s. response: %s. body: %s', ghRepo + item, error, JSON.stringify(response), body)
        return cb(error || response.statusCode)
      }
    })
  }

  async.parallel([function (cb) {
    getGitHubStats('/stats/contributors', cb)
  },
    function (cb) {
      getGitHubStats('/issues', cb)
    }], function (err, resArr) {
    var res = {}
    try {
      res.contributors = JSON.parse(resArr[0]).length
    } catch (ex) {
    }
    try {
      var issuesPrArr = JSON.parse(resArr[1])
      var issuesPrCnt = issuesPrArr.length
      var prCnt = _.reduce(issuesPrArr, function (result, item) {
        return result + ((item.pull_request) ? 1 : 0)
      }, 0)
      res.issues = issuesPrCnt - prCnt
      res.prs = prCnt
    } catch (ex) {
    }
    deferred.resolve(res)
  })
  return deferred.promise.nodeify(callback)
}

var ProgramService = {
  getProgramsFromArray: getProgramsFromArray,
  getPrograms: getPrograms,
  getGitHubFileProgram: getGitHubFileProgram,
  getProgramDetails: getProgramDetails
}

module.exports = ProgramService;

