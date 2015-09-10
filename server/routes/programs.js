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
var db = require('../models/db')
var _ = require('lodash')
var Q = require('q')


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

  app.get('/api/programs/', function (req, res) {

    getProgramsFromArray(config.programs, function (results) {
      var body = {
        "programs": results
      }
      res.send(body)
    }, function (error) {
      res.sendStatus(500)
    })
  })
  app.get('/api/programs/name/:title', function (req, res) {
    if (!req.params.title) {
      res.send(400, "Missing url title.")
      return
    }

    db.getProgramByName(req.params.title).then(function (data) {
      getProgramDetails(data, function (error, result) {
        if (error) {
          res.send(500)
        }
        res.send(_.merge({}, result, data))
      })
    })
  })

  app.patch('/api/programs/:id', function (req, res) {
    if (req.user.siteAdmin) {
      db.updateProgram(req.params.id, req.body).then(function (data) {
        res.end()
      })
      return
    }

    db.getProgram(req.params.id).then(function (program) {
      if (program.editors && program.editors.indexOf(req.user._id) >= 0) {
        db.updateProgram(req.params.id, req.body).then(function (data) {
          res.end()
        })
      }
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

function getProgramDetails(progData, callback) {
  var deferred = Q.defer()
    // Call github for stats
  if (!progData.githubUrl) {
    setTimeout(function () {
      deferred.resolve({})
    }, 0)
    return deferred.promise.nodeify(callback)
  }

  var getGitHubStats = function (item, cb) {
    var options = {
      url: 'https://api.github.com/repos/' + progData.githubUrl.substr(progData.githubUrl.indexOf('github.com') + 11) + item + "?client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret,
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
        logger.error('Error while fetching GitHub content: %s. response: %s. body: %s', error, response, body)
        return cb(error)
      }
    })
  }

  async.parallel([function (cb) {
      getGitHubStats('/stats/contributors', cb)
    },
                function (cb) {
      getGitHubStats('/issues', cb)
    }], function (err, resArr) {
    if (err) return deferred.reject(err)
    var issuesPrArr = JSON.parse(resArr[1])
    var issuesPrCnt = issuesPrArr.length
    var prCnt = _.reduce(issuesPrArr, function (result, item) {
      return result + ((item.pull_request) ? 1 : 0)
    }, 0)
    var res = {
      contributors: JSON.parse(resArr[0]).length,
      issues: issuesPrCnt - prCnt,
      prs: prCnt
    }
    deferred.resolve(res)
  })
  return deferred.promise.nodeify(callback)
}
