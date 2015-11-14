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

var mongoose = require('mongoose')

var attributeOriginDef = {
  identityOrigin: String, // where this attribute originated from
  attributeName: String, // name of attribute from origin
  value: String // denormalized value
}

exports.account = mongoose.model('Account', new mongoose.Schema({
  loggedInContext: String,
  labRequestStatus: String,
  identities: [{
    origin: String, // GitHub or LinkedIn
    identifier: String, // User's identifier from origin
    accessToken: String,
    refreshToken: String,
    attributes: [{ // a collection of identity attributes
      name: String,
      value: String
        }]
    }],
  profiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  }]
}))

exports.profile = mongoose.model('Profile', new mongoose.Schema({
  type: String, // Individual or Organization
  name: attributeOriginDef, // display name for profile
  username: String,
  visible: Boolean,
  contact: {
    email: [attributeOriginDef]
  },
  contactPreferences: {
    notifyMeOfAllUpdates: Boolean 
  }
},{
  strict: false
}))

// schemaless schemas
exports.program = mongoose.model('Program', new mongoose.Schema({}, {
  strict: false,
  id: false
}))

exports.number = mongoose.model('Number', new mongoose.Schema({}, {
  strict: false,
  id: false
}))

exports.labInstance = mongoose.model('LabInstance', new mongoose.Schema({}, {
  strict: false
}))
