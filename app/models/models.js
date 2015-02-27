var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var attributeOriginDef = {
    identityOrigin: String, // where this attribute originated from
    attributeName: String, // name of attribute from origin
    value: String // denormalized value
};

var accountSchema = new Schema({
    identities: [{
        origin: { type: Schema.Types.ObjectId, ref: 'Origin' }, // GitHub or LinkedIn
        identifier: String, // User's identifier from origin
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

var originSchema = new Schema({
    name: String, // github or linkedin
    miniIconUrl: String // URL to image
});


module.exports = {
    Account : mongoose.model('Account', accountSchema),
    Profile : mongoose.model('Profile', profileSchema),
    Origin : mongoose.model('Origin', originSchema)
};