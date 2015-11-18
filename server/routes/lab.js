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
            var nodemailer = require('nodemailer');
            var transporter = nodemailer.createTransport();
            var body = 'Hello,\n'
            body += req.user.profiles[0].username
            body += req.user.profiles[0].name ? '(' + req.user.profiles[0].name + ')' : ''
            body += ' requested access to lab. To grant access, open '
            + req.protocol + '://' + req.get('host') + '/lab/admin. If you cannot find the user in the approval pending list, chances are another site administrator has handled the request.'
            transporter.sendMail({
              from: config.lab.email.sender,
              to: config.lab.email.recipients.toString(),
              subject: 'Request lab access',
              text: body
            });
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
    if (req.user.labRequestStatus !== 'approved') {
      return res.sendStatus(403)
    }
    next()
  })
  .get(function (req, res, next) {
    db.getLabInstances((Object.keys(req.query).length > 0) ? req.query : {creatorId: req.user._id}).then(function (data) {
      res.send(data)
    })
  })
  .post(function (req, res, next) {
    var data = req.body
    if (!data._id) {
      // create instance
      data.creatorId = req.user._id
      var inst = new db.models.labInstance(data)
      inst.save(function (err, data) {
        if (err) {
          return res.sendStatus(500)
        }
        return res.send(data)
      })
    } else {
      // update instance
      var id = data._id
      delete data._id
      delete data.__v

      db.models.labInstance.findByIdAndUpdate(id, data, function (err, doc) {
        if (err) {
          return res.sendStatus(500)
        }
        return res.sendStatus(200)
      })
    }
  })
  .delete(function (req, res) {
    db.models.labInstance.findByIdAndRemove(req.params.id, function (err) {
      if (err) {
        return res.sendStatus(500)
      }
      return res.sendStatus(200)
    })
  })
}