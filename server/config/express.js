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


/**
 * Express configuration
 */

'use strict'

var express = require('express')
var favicon = require('serve-favicon')
var morgan = require('morgan')
var compression = require('compression')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var cookieParser = require('cookie-parser')
var errorHandler = require('errorhandler')
var path = require('path')
var config = require('./environment')

module.exports = function(app) {
  var env = app.get('env')

  app.engine('html', require('ejs').renderFile)
  app.set('view engine', 'html')
  app.use(compression())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(methodOverride())
  app.use(cookieParser())

  app.use(function(req, res, next) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate")
    res.header("Pragma", "no-cache")
    res.header("Expires", 0)
    next()
  })

  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')))
    app.use("/embedded/swagger-editor", express.static(path.normalize(__dirname + '/../../../node_modules/swagger-editor-src/dist')))
    app.use(express.static(path.join(config.root, 'public')))
    app.use('/node_modules', express.static(path.normalize(__dirname + '/../../../node_modules')))
    app.set('appPath', config.root + '/public')
    app.use(morgan('dev'))
  }

  if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')())
    app.use("/embedded/swagger-editor", express.static(path.normalize(__dirname + '/../../node_modules/swagger-editor-src/.tmp')))
    app.use("/embedded/swagger-editor", express.static(path.normalize(__dirname + '/../../node_modules/swagger-editor-src/app')))
    app.use('/node_modules', express.static(path.normalize(__dirname + '/../../node_modules')))
    app.use(express.static(path.join(config.root, '.tmp')))
    app.use(express.static(path.join(config.root, 'client')))
    app.set('appPath', 'client')
    app.use(morgan('dev'))
    app.use(errorHandler()) // Error handler - has to be last
  }
  app.set('views', [app.get('appPath'), config.root + '/server/views'])
}