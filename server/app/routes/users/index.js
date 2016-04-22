'use strict';
var router = require('express').Router();
var models = require('../../../db/models');
var User = models.User;
module.exports = router;

router.get('/', function (req, res, next) {
	User.find({})
	.then(function(users){
		res.send(users);
	})
});

router.get('/:id', function(req, res, next){
	var id = req.params.id;
	User.findById(id)
	.then(function(user){
		res.send(user);
	})
})

// router.post('/', function(req, res, next){

// })

// router.put('/:id', function(req, res, next){
	
// })

// router.delete('/:id', function(req, res, next){
	
// })