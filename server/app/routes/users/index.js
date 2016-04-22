'use strict';
var router = require('express').Router();
var models = require('../../../db/models');
var User = models.User;
module.exports = router;

//Note - Still need to implement access control!

router.get('/', function (req, res, next) {
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
	console.log("PARAMS", req.body);
	User.create(req.body)
	.then(function(newUser){
		res.send(newUser);
	})
	.then(null, next);
})

router.put('/:id', function(req, res, next){
	// Need to DELETE certain fields and configure access control.
	User.findByIdAndUpdate(req.params.id, req.body, {new: true})
	.then(function(updatedUser){
		res.send(updatedUser);
	})
	.then(null, next);
})

router.delete('/:id', function(req, res, next){
	User.findByIdAndRemove(req.params.id)
	.then(function(){
		res.redirect('/');
	})
	.then(null, next);
})