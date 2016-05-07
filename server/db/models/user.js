'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var _ = require('lodash');

var schema = new mongoose.Schema({
    email: {
        type: String,
        required: true
        // unique: true (Need to enforce this with custom validation. Interferes with PUT route) 
    },
    password: {
        type: String,
        required: true
        // select: false (Looks like sanitize method takes care of this)
    },
    salt: {
        type: String
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['User', 'Admin'],
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true //Not in spec, but I feel like this makes sense.
    },
    origId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    pendingPasswordReset: {
        type: Boolean,
        required: true,
        default: false //Not in spec, but I feel like this makes sense.
    },
    dateCreated: {
        type: Date,
    },
    dateModified: {
        type: Date
    }

    /* These don't seem to be used anywhere in our application. 
       Also, we have no plans (that I'm aware of) to allow users to authenticate via oAuth, right?
       We can probably get rid of this (just want to double check and make sure it won't break anything - it shouldn't).

    twitter: {
        id: String,
        username: String,
        token: String,
        tokenSecret: String
    },
    facebook: {
        id: String
    },
    google: {
        id: String
    }
    */
});

// method to remove sensitive information from user objects before sending them out
schema.methods.sanitize = function () {
    return _.omit(this.toJSON(), ['password', 'salt']);
};


// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
var generateSalt = function () {
    return crypto.randomBytes(16).toString('base64');
};

var encryptPassword = function (plainText, salt) {
    var hash = crypto.createHash('sha1');
    hash.update(plainText);
    hash.update(salt);
    return hash.digest('hex');
};

schema.pre('save', function (next) {

    if (this.isModified('password')) {
            
            this.salt = this.constructor.generateSalt();
            this.password = this.constructor.encryptPassword(this.password, this.salt);    
        
    }

    if(this.isNew){
        this.dateCreated = Date.now();
        if(!this.origId){
            this.origId = this._id;
        }
        
    }

    next();

});



schema.statics.generateSalt = generateSalt;
schema.statics.encryptPassword = encryptPassword;

schema.method('correctPassword', function (candidatePassword) {
    return encryptPassword(candidatePassword, this.salt) === this.password;
});

module.exports = mongoose.model('User', schema);