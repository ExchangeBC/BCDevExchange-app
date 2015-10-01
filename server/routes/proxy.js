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

module.exports = function (app, db, passport) {
  app.get(/api\/proxy\/get\/(.+)/, function (req, res) {
    request(req.params[0], function(err, response, body){
      _.forOwn(response.headers, function(v, k){
        res.set(k, v)
      })
      res.status(response.statusCode).send(body).end()
    })
  })
}
