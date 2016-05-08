'use strict';
var mongoose = require('mongoose');
var router = require('express').Router();
var models = require('../../../db/models');
var authorization = require('../../configure/authorization-middleware.js')
var User = models.User;
var mail = require('../../../mail');
module.exports = router;

//(This route is used in admin pages)
router.get('/fields', function (req, res, next) {
    if(!req.user)
        res.send(readWhitelist.Any);
    res.send(readWhitelist[req.user.role]);
});

//Req Params
router.param('id', function(req, res, next, id){

    User.findById(id).exec()
    .then(function(user){
        if(!user) res.status(404).send();
        req.requestedUser = user;
        next();
    })
    .then(null, next);
})

//Route Handlers
router.get('/', authorization.isAdmin, function (req, res, next) {
    User.find({dateModified : {$exists : false }})
    .then(function(users){
        res.send(users);
    })
    .then(null, next);
});

router.get('/:origId/history', function(req, res, next){
    var origId = req.params.origId;
    User.find({origId: origId}).sort('dateCreated')
        .then(function(history){
            res.send(history);
        })
        .then(null, next);
});

router.get('/:id', authorization.isAdminOrSelf, function(req, res, next){
    var id = req.params.id;
    User.findById(id)
    .then(function(user){
        res.send(user);
    })
    .then(null, next);
})

router.get('/activation/:activationKey', function(req, res, next) {
    console.log("In activation route...");
    User.findOne({activationKey: req.params.activationKey, dateModified : {$exists : false }})
    .then(function(user) {
        console.log("user found for activation...", user);
        user.active = true;
        delete user.activationKey;
        return user.save();    
    })
    .then(function(savedUser) {
        res.send(savedUser);
    })
    .catch(function(err) {
        console.log("Error when trying to activate!", err);
        return {active: false};
    });
});

router.post('/', function(req, res, next){
	var newUser;
    User.create(req.body)
	.then(function(_newUser){
        newUser = _newUser;
        return User.find({email: newUser.email, _id: {$ne: newUser._id} });
    })
    .then(function(existingUsers){
        if(existingUsers.length > 0){
            res.status(400).send("Please use unique email.")
        }
        else {
            if(!req.user) {
                newUser.active = false;
                newUser.activationKey = Math.random().toString(36).slice(3,10);
                return newUser.save();
            }
            else 
                return res.send(newUser);      
        }
    })
    .then(function(savedUser) {
        mail.sendActivation(savedUser.email, savedUser.activationKey);
        res.send(savedUser);
    })
	.catch(function(err) {
        console.log(err);
        res.status(500).send(err);
    });
})

router.put('/:id', authorization.isAdminOrSelf, function(req, res, next){
    
    //If self, delete certain fields - this isn't free license to edit any field.

	//Find user by ID, add dateModified timestamp, but return ORIGINAL User object
    User.findByIdAndUpdate(req.params.id, {dateModified: Date.now()})
    .then(function(originalUser){
    	;
    	//Create new User object from old object properties + submitted changes
    	var newUser = {};
    	var originalUserObj = originalUser.toObject();
    	for(var key in originalUserObj){
    		if(key != '_id' && key != 'password'){
            	newUser[key] = originalUser[key];
    		}
    	}
    	for(var key in req.body){
    		if(key != '_id') {
                newUser[key] = req.body[key];
            }
        }

        //Save to backend and return
        return User.create(newUser);
    })
    .then(function(updatedUser) {
        res.send(updatedUser);
    })
    .then(null, next);
});

router.delete('/:id', authorization.isAdmin, authorization.isNotSelf, function(req, res, next){
    User.findByIdAndUpdate(req.params.id, {dateModified: Date.now()}, {new: true})
    .then(function(deletedUser) {
        res.send(deletedUser);
    })
    .then(null, next);
})

//Whitelists
var readWhitelist = {
    Any: ['firstName', 'middleName', 'lastName', 'email'],
    User: ['firstName', 'middleName', 'lastName', 'email', 'dateCreated', 'origId', '_id', 'active', 'pendingPasswordReset', 'role'],
    Admin: ['firstName', 'middleName', 'lastName', 'email', 'password', 'dateCreated', 'origId', '_id', 'active', 'pendingPasswordReset', 'role']
};

var writeWhitelist = {
    Any: [],
    User: ['firstName', 'middleName', 'lastName', 'email'],
    Admin: ['firstName', 'middleName', 'lastName', 'email', 'password', 'active', 'pendingPasswordReset', 'role']
};
