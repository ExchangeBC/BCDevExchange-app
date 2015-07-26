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


var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var attributeOriginDef = {
    identityOrigin: String, // where this attribute originated from
    attributeName: String, // name of attribute from origin
    value: String // denormalized value
};

var accountSchema = new Schema({
    loggedInContext: String,
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
    profiles: [{ type: Schema.Types.ObjectId, ref: 'Profile' }]
});

var profileSchema = new Schema({
    type: String, // Individual or Organization
    name: attributeOriginDef, // display name for profile
    visible: Boolean,
    contact: {
        email: attributeOriginDef
    },
    contactPreferences: {
        notifyMeOfAllUpdates: Boolean
    }
});


module.exports = {
    Account : mongoose.model('Account', accountSchema),
    Profile : mongoose.model('Profile', profileSchema)
};
