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
var request = require('request')
var _ = require('lodash')
var config = require('config')
var db = require('../models/db')
var Q = require('q')

exports.api = function (app, db, passport) {
  app.all(/api\/proxy\/(.+)/, function (req, res) {
    var opts = {
      url: req.params[0],
      method: req.method,
      qs: req.query,
      body: req.body,
      json: true
    }
    request(opts, function (err, response, body) {
      if (err) {
        return res.status(500).end()
      }
      try {
        _.forOwn(response.headers, function (v, k) {
          res.set(k, v)
        })
      } catch (ex) {
      }
      res.status(response.statusCode).send(body).end()
    })
  })
}

// This lab proxy is a backup. Use KONG as primary proxy engine
exports.lab = function (app, db, passport) {
  app.use(function (req, res, next) {
    var escapeStringRegexp = require('escape-string-regexp')
    var labRegEx = new RegExp("^" + escapeStringRegexp(config.lab.proxyHostNamePrefix) + "(.+)"
      + escapeStringRegexp(config.lab.proxyHostNameSuffix))
    var matches = req.hostname.match(labRegEx)
    if (!matches) {
      return next()
    }
    var url
    db.getLabInstances({name: matches[1]}, function (err, data) {
      if (err || !data || data.length < 1) {
        return res.sendStatus(404)
      }
      if (data[0].type === 'proxy') {
        url = data[0].siteUrl
      }
      if (data[0].type === 'labInstance') {
        if (!data[0].hostPort) {
          return res.sendStatus(404)
        }
        url = config.lab.labInstanceProtocolAndHost + ":" + data[0].hostPort
      }
      if (!url) {
        return res.sendStatus(404)
      }
      var headers = {}
      _.merge(headers, req.headers)
      delete headers.host
      delete headers['accept-encoding']
      var opts = {
        url: url,
        method: req.method,
        qs: req.query,
        body: req.body,
        headers: headers
      }
      request(opts, function (err, response, body) {
        if (err) {
          return res.status(500).end()
        }
        try {
          _.forOwn(response.headers, function (v, k) {
            res.set(k, v)
          })
        } catch (ex) {
        }
        res.status(response.statusCode).send(body)
      })
    })
  })
}