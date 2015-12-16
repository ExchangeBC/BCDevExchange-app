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
var clone = require('clone')
var merge = require('merge')
var db = require('../models/db')
var _ = require('lodash')
var Q = require('q')
var ProgramService = require('../services/program-service')

module.exports = function (app, db, passport) {

  app.get('/api/programs/', function (req, res) {

    ProgramService.getProgramsFromArray(config.programs, function (results) {
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
      return res.status(400).send("Missing url title.")
    }

    db.getProgramByName(req.params.title).then(function (data) {
      ProgramService.getProgramDetails(data, function (error, result) {
        console.log("data, results" , data, result);
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
