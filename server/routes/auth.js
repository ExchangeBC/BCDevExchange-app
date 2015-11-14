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

var config = require('config')
var logger = require('../../common/logging.js').logger
var request = require('request')

// simple route middleware to ensure user is authenticated
// use this route middleware on any resource that needs to be protected
// if the request is authenticated the request will proceed
var ensureAuthenticated = exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    res.sendStatus(401)
  }
}

exports.routes = function (app, db, passport) {

  function loginCallbackHandler(req, res, logger) {
    var dest = req.session.auth_redirect || ('/account?login=success&id=' + req.user.id)
    req.session.auth_redirect = undefined
    res.redirect(dest)
  }

  function populateAccount(req, res, id, db, config, logger) {
    db.getAccountById(id, true,
      function (err, account) {
        if (err) {
          logger.error(err)
          res.sendStatus(500)
        }

        var options = {}
        var authContext = req.user.loggedInContext
        if (authContext === config.github.name) {
          options = {
            url: config.github.baseURL + '/user',
            headers: {
              'User-Agent': config.github.clientApplicationName
            }
          }
        } else if (authContext === config.linkedin.name) {
          var baseURL = config.linkedin.baseURL
          var appName = config.linkedin.clientApplicationName

          options = {
            url: config.linkedin.baseURL + '/people/~:(id,formatted-name)',
            headers: {
              'Content-Type': 'application/json',
              'x-li-format': 'json'
            }
          }
        }

        var accessToken = ""
        var i = 0
        while (i < req.user.identities.length) {
          if (req.user.identities[i].origin === authContext) {
            accessToken = req.user.identities[i].accessToken
            break
          }
          i++
        }

        request(options, function (error, response, body) {
          if (!error &&
            typeof response !== 'undefined' &&
            response.statusCode === 200) {

            var json = JSON.parse(body)

            // fill in details that aren't stored on our side
            if (authContext === config.github.name) {
              account.profiles[0].name = {
                identityOrigin: authContext,
                attributeName: 'name',
                value: json.name || json.login
              }
            } else if (authContext === config.linkedin.name) {
              account.profiles[0].name = {
                identityOrigin: authContext,
                attributeName: 'name',
                value: json.formattedName
              }
            }

            res.send(account)
          } else if (error) {
            logger.error('Error while fetching user info', error, body)
            res.sendStatus(500)
          }
        }).auth(null, null, true, accessToken)

      })
  }
  // ===== authentication page routing ======

  // GET /auth/github
  // use passport.authenticate() as route middleware to authenticate the request
  app.get('/auth/github', function (req, res, next) {
    if (req.get('Referer') && !req.get('Referer').match(/\/signup$/i)) {
      req.session.auth_redirect = req.get('Referer')
    }
    next()
  }, passport.authenticate('github', {
    scope: ['user:email']
  }),
    function (req, res) {
      console.log("response from github: " + res)
      //the request will be redirected to github for auth, so this function will not be called
    })

  // GET /auth/github/callback
  // use passport.authenticate() as route middleware to authenticate the request
  // if auth fails, the user will be redirected back to the login page
  // otherwise, the primary route function will be called which will redirect the user to the home page
  app.get('/auth/github/callback',
    passport.authenticate('github', {
      scope: ['user', 'repo'],
      failureRedirect: '/login'
    }),
    function (req, res) {
      loginCallbackHandler(req, res, logger)
    })

  // GET /auth/linkedin
  // use passport.authenticate() as route middleware to authenticate the request
  app.get('/auth/linkedin',
    passport.authenticate('linkedin'),
    function (req, res) {
      //the request will be redirected to linkedin for auth, so this function will not be called
    })

  // GET /auth/linkedin/callback
  // use passport.authenticate() as route middleware to authenticate the request
  // if auth fails, the user will be redirected back to the login page
  // otherwise, the primary route function will be called which will redirect the user to the home page
  app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', {
      failureRedirect: '/login'
    }),
    function (req, res) {
      loginCallbackHandler(req, res, logger)
    })

  // ===== logout routing ======

  app.post('/logout', function (req, res) {
    req.logOut()
    req.session.destroy()
    res.sendStatus(200)
  })

  // ===== account page routing ======

  app.get('/api/account/:id', ensureAuthenticated, function (req, res) {
    populateAccount(req, res, req.params.id, db, config, logger)
  })

  app.patch('/api/account/:id', ensureAuthenticated, function (req, res) {
    if (!req.user.siteAdmin) {
      return res.sendStatus(403)
    }
    db.updateAccount(req.params.id, req.body).then(function () {
      res.end()
    }, function () {
      res.sendStatus(500)
    })
  })

  app.get('/api/account', ensureAuthenticated, function (req, res) {
    if (!req.query.q) {
      populateAccount(req, res, req.user._id, db, config, logger)
    } else if (req.query.q === 'isAProgramOwner') {
      db.getPrograms({editors: req.user._id}).then(function (data) {
        res.send([data.length > 0])
      })
    } else {
      if (!req.user.siteAdmin) {
        return res.sendStatus(403)
      }
      db.queryAccounts(JSON.parse(req.query.q), function (err, accts) {
        if (err) {
          return res.sendStatus(500)
        }
        res.send(accts)
      })
    }
  })
  app.get('/api/accountCheck', function (req, res) {
    if (req.isAuthenticated()) {
      populateAccount(req, res, req.user._id, db, config, logger)
    } else {
      res.sendStatus(403)
    }
  })

  app.post('/api/account/:id', ensureAuthenticated, function (req, res) {
    var acctData = req.body

    db.getAccountById(acctData._id, true,
      function (err, account) {
        if (err) {
          logger.error(err)
        }

        if (account) {
          account.profiles[0].visible = acctData.profiles[0].visible
          account.profiles[0].contactPreferences.notifyMeOfAllUpdates = acctData.profiles[0].contactPreferences.notifyMeOfAllUpdates
          account.profiles[0].save(function (err) {
            if (err) {
              logger.error(err)
            }

            res.json(account)

          })
        }
      })
  })
}
