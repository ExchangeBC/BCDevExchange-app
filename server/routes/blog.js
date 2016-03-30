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

module.exports = function (app, db, passport) {
  app.get('/api/blog/', function (req, res) {
    function getBlogs(url, cb) {
      var options = {
        url: url
      }
      request(options, function (error, response, body) {
        if (error) {
          // error from one data source should be tolerated
          return cb(null, null)
        }
        var parseString = require('xml2js').parseString
        parseString(body, function (err, result) {
          cb(null, result.rss.channel[0].item)
        })
      })
    }

    async.parallel([
      function (cb) {
        var page = parseInt(req.query.p)
        if (!isNaN(page) && page > 1) {
          return cb(null, null)
        }
        getBlogs((config.jekyllBlogUrl || config.ui.jekyllBlogUrl) + '/feed.xml' + (req.query.p ? ('?paged=' + req.query.p) : ''), cb)
      },
      function (cb) {
        getBlogs('http://blog.data.gov.bc.ca/feed/?category=BCDev' + (req.query.p ? ('&paged=' + req.query.p) : ''), cb)
      }
    ], function (err, data) {
      var parsedRes = {'blog': data}
      res.send(parsedRes)
    })
  })
}
