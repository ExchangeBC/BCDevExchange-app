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


module.exports = function (app, db, passport) {
  var config = require('config')
  var logger = require('../../common/logging.js').logger
  var Q = require('q')
  var auth = require('./auth.js')
  var async = require('async')
  var request = require('request')
  var _ = require('lodash')

  app.post("/api/lab/request",
    function (req, res) {
      if (!req.isAuthenticated()) {
        return res.status(403).end()
      }
      var deferred = Q.defer()
      if (req.user.siteAdmin) {
        deferred.resolve()
      } else {
        db.getPrograms({editors: req.user._id}).then(function (data) {
          if (data.length > 0) {
            return deferred.resolve()
          }
          return deferred.reject()
        })
      }
      deferred.promise.then(function () {
        db.getAccountById(req.user._id, false,
          function (err, account) {
            if (err) {
              logger.error(err)
              return res.status(500).end()
            }
            if (account.labRequestStatus) {
              return res.status(403).send('You have previously sent a request. There is no need to resend.')
            }
            account.labRequestStatus = "pending"
            account.save(function (err) {
              if (err) {
                logger.error(err)
                return res.status(500).end()
              }
              try {
                var nodemailer = require('nodemailer')
                var transporter = nodemailer.createTransport()
                var body = 'Hello,\n'
                var user = req.user.profiles[0].username
                user += req.user.profiles[0].name ? '(' + req.user.profiles[0].name + ')' : ''
                body += user
                body += ' requested access to lab. To grant access, open '
                  + req.protocol + '://' + req.get('host') + '/lab/admin. If you cannot find the user in the approval pending list, chances are another site administrator has handled the request.'
                transporter.sendMail({
                  from: config.lab.email.sender,
                  to: config.lab.email.recipients.toString(),
                  subject: 'Request lab access',
                  text: body
                })
                logger.info('Email sent for lab request from ' + user + '.')
                return res.sendStatus(200)
              } catch (ex) {
                return res.status(500).end()
              }
            })
          })
      })
    }
  )

  app.route('/api/lab/instances/:id?').all(auth.ensureAuthenticated).all(function (req, res, next) {
      db.getAccountById(req.user._id, false, function (err, acct) {
        if (err || acct.labRequestStatus !== 'approved') {
          return res.sendStatus(403)
        }
// make sure instance belongs to user
        var instId
        if (req.method === 'DELETE' && req.params.id) {
          instId = req.params.id
        } else if (req.method === 'POST' && req.body) {
          instId = req.body._id
        }
        if (!instId) {
          return next()
        }
        db.models.labInstance.findById(instId).lean().exec(function (err, data) {
          if (!data.creatorId || data.creatorId !== req.user._id) {
            return res.sendStatus(403)
          }
          return next()
        })
      })
    })
    .get(function (req, res, next) {
      db.getLabInstances(req.query.q ? JSON.parse(req.query.q, function (key, value) {
        if (value.toString().indexOf("__REGEXP ") == 0) {
          var m = value.split("__REGEXP ")[1].match(/\/(.*)\/(.*)?/)
          return new RegExp(m[1], m[2] || "")
        } else
          return value
      }) : {creatorId: req.user._id}).then(function (data) {
        res.send(data)
      })
    })
    .post(function (req, res, next) {
      var data = req.body
      // create instance
      function createInstance(callback) {
        data.creatorId = req.user._id
        var inst = new db.models.labInstance(data)
        inst.save(function (err, data) {
          if (err) {
            return callback(err, data)
          } else {
            switch (data.get('type')) {
              case 'labInstance':
                addJenkinsJob(data, function (err, data) {
                  if (err) {
                    return callback(err, null)
                  }
                  addKongApi(data, callback)
                })
                break;
              case 'proxy':
                addKongApi(data, callback)
                break;
            }
          }
        })
      }

      // add Kong API
      function addKongApi(data, callback) {
        var upstreamUrl, preserve_host
        switch (data.get('type')) {
          case 'proxy':
            upstreamUrl = data.get('siteUrl')
            preserve_host = false
            break
          case 'labInstance':
            if (!data.get('hostPort')) {
              return callback(500, null)
            }
            upstreamUrl = config.lab.labInstanceProtocolAndHost + ":" + data.get('hostPort')
            preserve_host = true
            break
        }

        var postData = {
          name: 'lab-' + data.get('name'),
          upstream_url: upstreamUrl,
          preserve_host: preserve_host,
          request_host: config.lab.proxyHostNamePrefix + data.get('name') + config.lab.proxyHostNameSuffix
        }
        request.post({url: config.lab.kongAdminUrl, form: postData}, function (err, response, body) {
          if(err){
            return callback(err, null)
          }
          var bodyObj = JSON.parse(body)
          db.models.labInstance.findByIdAndUpdate(data._id, {kongId: bodyObj.id}, function (err, savedData) {
            callback(err, savedData)
          })
        })
      }

      // add Jenkins job
      function addJenkinsJob(data, callback) {
        // reserved host port range, must not overlap with ephemeral port range
        var resHostPortStart = 20001, resHostPortEnd = 25000, resHostPortRange = []
        for (var i = resHostPortStart; i < resHostPortEnd; i++) {
          resHostPortRange.push(i)
        }
        db.models.labInstance.find({type: 'labInstance', hostPort: {$ne: null}})
          .distinct('hostPort').exec(function (err, results) {
          var availablePorts = _.difference(resHostPortRange, results)
          data.set('hostPort', availablePorts[Math.floor(availablePorts.length * Math.random())])
          data.save(function (err) {
            // call Jenkins DSL seed job to create a new job
            var postData = {
              name: data.get('name'),
              githubRepo: data.get('githubRepoOwner') + '/' + data.get('githubRepo'),
              gitBranch: data.get('gitBranch'),
              dockerfilePath: data.get('dockerfilePath'),
              dockerPort: data.get('dockerPort'),
              hostPort: data.get('hostPort')
            }
            request.post(config.lab.jenkinsUrl + config.lab.jenkinsJobCreatorBuildUrlFragment)
              .auth(config.lab.jenkinsUser, config.lab.jenkinsApiToken)
              .form(postData).on('response', function (response) {
              callback(err, data)
            })
          })
        })
      }

      // update instance
      function updateInstance(callback) {

        var id = data._id
        delete data._id
        delete data.__v

        db.models.labInstance.findByIdAndUpdate(id, data, function (err, doc) {
          callback(err, doc)
        })
      }

      // update Kong API
      function updateKongApi(callback) {
        var patchData = {
          name: 'lab-' + data.name,
          upstream_url: data.siteUrl,
          request_host: config.lab.proxyHostNamePrefix + data.name + config.lab.proxyHostNameSuffix
        }
        request.patch({url: config.lab.kongAdminUrl + data.kongId, form: patchData}, function (err, response, body) {
          callback(err, {response: response, body: body})
        })
      }

      // TODO: update Jenkins job
      function updateJenkinsJob(callback) {
        callback(null, null)
      }

      var parallelJobs
      if (!data._id) {
        parallelJobs = [createInstance]
      } else {
        parallelJobs = [updateInstance]
        switch (data.type) {
          case 'labInstance':
            parallelJobs.push(updateKongApi)
            parallelJobs.push(updateJenkinsJob)
            break
          case 'proxy':
            parallelJobs.push(updateKongApi)
            break
        }
      }
      async.parallel(parallelJobs, function (err, results) {
        if (err) {
          return res.sendStatus(500)
        }
        return res.send(results[0])
      })
    })
    .delete(function (req, res) {
      db.models.labInstance.findById(req.params.id, function (error, data) {

        function deleteInstance(callback) {
          db.models.labInstance.findByIdAndRemove(req.params.id, function (err) {
            callback(err, null)
          })
        }

        // delete Kong API
        function deleteKongApi(callback) {
          request.del(config.lab.kongAdminUrl + data.get('kongId'), function (err, response, body) {
            callback(err, null)
          })
        }

        // delete Jenkins job
        function deleteJenkinsJob(callback) {
          request.post({
            url: config.lab.jenkinsUrl + config.lab.jenkinsJobTerminatorBuildUrlFragment,
            form: {
              name: data.get('name')
            },
            auth: {
              'user': config.lab.jenkinsUser,
              'pass': config.lab.jenkinsApiToken,
              'sendImmediately': true
            }
          }, function (err, response, body) {
            callback(err, response)
          })
        }

        var parallelJobs = [deleteInstance]
        switch (data.get('type')) {
          case 'labInstance':
            parallelJobs.push(deleteKongApi)
            parallelJobs.push(deleteJenkinsJob)
            break
          case 'proxy':
            parallelJobs.push(deleteKongApi)
            break
        }

        async.parallel(parallelJobs, function (err, results) {
          if (err) {
            return res.sendStatus(500)
          }
          return res.sendStatus(200)
        })
      })
    })
}
