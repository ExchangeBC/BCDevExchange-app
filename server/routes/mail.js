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
  app.post("/api/mail",
    function (req, res) {
      if (req.isAuthenticated() && req.body.action === 'lab') {
        try {
          var nodemailer = require('nodemailer');
          var transporter = nodemailer.createTransport();
          var body = 'Hello,\n'
          body += req.user.profiles[0].username
          body += req.user.profiles[0].name ? '(' + req.user.profiles[0].name + ')' : ''
          body += " requested access to lab. To grant access, open " 
            + req.protocol + '://' + req.get('host') + '/lab/admin.'

          transporter.sendMail({
            from: config.lab.email.sender,
            to: config.lab.email.recipients.toString(),
            subject: 'Request lab access',
            text: body
          });
          return res.sendStatus(200)
        } catch (ex) {
          return res.sendStatus(500)
        }
      }
      res.sendStatus(403)
    }
  )
}
