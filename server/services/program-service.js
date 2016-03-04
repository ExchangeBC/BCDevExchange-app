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


exports.getProgramsFromArray = function (programList, success, error) {
  async.concat(programList, exports.getPrograms, function (err, results) {
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

exports.getPrograms = function (program, callback) {

  if (program.type === "github-file") {
    exports.getGitHubFileProgram(program, callback)
  } else {
    console.error("Configuration error, unknown program type: " + program.type)
  }

}

exports.getGitHubFileProgram = function (ghConfig, callback) {
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
        console.error(message)
        return callback(message)
      }
      // remove extraneous info from result
      async.concat(programYaml, parseGitHubFileResults, function (err, results) {
        return callback(err, results)
      })
    } else {
      console.error('Error while fetching GitHub content: %s. response: %s. body: %s', error, response, body)
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

exports.getGitHubList = function (ghRepo, item, cb) {
  var url = 'https://api.github.com/repos/' + ghRepo + item + "&client_id=" + config.github.clientID + "&client_secret=" + config.github.clientSecret
  var statsResArr = []
  var retryCnt = 0
  var queryGitHub = function (url, cb) {
    var options = {
      url: url,
      headers: {
        'User-Agent': config.github.clientApplicationName
      }
    }
    request(options, cb)
  }
  var parseRes = function (error, response, body) {
    if (!error &&
      typeof response !== 'undefined') {
      switch (response.statusCode) {
        case 200:
          retryCnt = 0
          Array.prototype.push.apply(statsResArr, JSON.parse(body))
          var matchUrl
          if (response.headers.link && (matchUrl = response.headers.link.match(/<(https:\/\/api.*)>;\s+rel="next"/))) {
            url = matchUrl[1]
            queryGitHub(url, parseRes)
          }
          else {
            return cb(null, statsResArr)
          }
          break
        case 202:
          if(retryCnt++ < 5){
            // retry in 100ms
            console.info('received response code 202. Retry.')
            setTimeout(function () {
              queryGitHub(url, parseRes)
            }, 100)
            break
          }
        default:
          console.error('Error fetching GitHub content for %s: %s. response: %s. body: %s', ghRepo + item, error, JSON.stringify(response), body)
          return cb(error || response.statusCode)
      }
    } else {
      console.error('Error fetching GitHub content for %s: %s. response: %s. body: %s', ghRepo + item, error, JSON.stringify(response), body)
      return cb(error || response.statusCode)
    }
  }
  queryGitHub(url, parseRes)
}


exports.getProgramDetails = function (progData, callback) {

  var deferred = Q.defer()
  // Call github for stats
  var githubStatsUrl = progData.githubStatsUrl || progData.githubUrl
  if (!githubStatsUrl) {
    setTimeout(function () {
      deferred.resolve({})
    }, 0)
    return deferred.promise.nodeify(callback)
  }

  var ghRepo = githubStatsUrl.substr(githubStatsUrl.indexOf('github.com') + 11)
  async.parallel([function (cb) {
    exports.getGitHubList(ghRepo, '/contributors?per_page=100', cb)
  },
    function (cb) {
      exports.getGitHubList(ghRepo, '/issues?state=all&per_page=100', cb)
    }], function (err, resArr) {
    var res = {}
    try {
      res.contributors = resArr[0].length
    } catch (ex) {
    }
    try {
      var issuesPrArr = resArr[1]
      res.prs = _.reduce(issuesPrArr, function (result, item) {
        return result + ((item.pull_request && item.state === 'closed') ? 1 : 0)
      }, 0)

      res.issues = _.reduce(issuesPrArr, function (result, item) {
        return result + ((!item.pull_request && item.state === 'open') ? 1 : 0)
      }, 0)

      // find help wanted issues
      res.helpWantedIssues = issuesPrArr.filter(function (e, i, a) {
        if (e.pull_request || e.state !== 'open') {
          return false
        }
        var helpIdx = _.findIndex(e.labels, function (e, i, a) {
          var name = e.name
          return name === 'help wanted'
        })
        return helpIdx >= 0
      })

      // find closed help wanted issues
      res.closedHelpWantedIssues = issuesPrArr.filter(function (e, i, a) {
        if (e.pull_request || e.state !== 'closed') {
          return false
        }
        var helpIdx = _.findIndex(e.labels, function (e, i, a) {
          var name = e.name
          return name === 'help wanted'
        })
        return helpIdx >= 0
      })

    } catch (ex) {
    }
    deferred.resolve(res)
  })
  return deferred.promise.nodeify(callback)
}
