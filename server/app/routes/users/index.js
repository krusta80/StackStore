'use strict';
var mongoose = require('mongoose');
var router = require('express').Router();
var models = require('../../../db/models');
var User = models.User;
module.exports = router;

//Note - Still need to implement access control!

router.get('/', function (req, res, next) {
	console.log(models, "models")
	User.find({})
	.then(function(users){
		res.send(users);
	})
	.then(null, next);
});

router.get('/:id', function(req, res, next){
	var id = req.params.id;
	User.findById(id)
	.then(function(user){
		res.send(user);
	})
	.then(null, next);
})

router.post('/', function(req, res, next){
	User.create(req.body)
	.then(function(newUser){
		res.send(newUser);
	})
	.then(null, next);
})

//To-do: Need to DELETE certain fields and configure access control.
router.put('/:id', function(req, res, next){
	//Find user by ID, add dateModified timestamp, but return ORIGINAL User object
    User.findByIdAndUpdate(req.params.id, {modifiedDate: Date.now()})
    .then(function(originalUser){
    	//Create new User object with properties of old object, sans timestamp.  
        var newUser = req.body; 
        newUser.origId = originalUser.origId; //New ID automatically generated, but store original ID.
        return newUser.save(); //Save and return the new user object.
    })
    .then(function(updatedUser) {
        res.send(updatedUser);
    })
    .then(null, next);
});

router.delete('/:id', function(req, res, next){
    User.findByIdAndUpdate(req.params.id, {modifiedDate: Date.now()}, {new: true})
    .then(function(deletedUser) {
        res.send(deletedUser);
    })
    .then(null, next);
})