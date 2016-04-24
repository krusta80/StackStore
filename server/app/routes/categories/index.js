'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Category = mongoose.model('Category');

module.exports = router;

router.get('/', function(req, res, next){
	Category.find({})
		.then(function(categories){
			res.send(categories);
		})
		.then(null, next);
});

router.get('/:id', function(req, res, next){
	var id = req.params.id;
	Category.findById(id)
		.then(function(category){
			res.send(category);
		})
		.then(null, next);
});

router.post('/', function(req, res, next){
	Category.create(req.body)
		.then(function(newCategory){
			res.send(newCategory);
		})
		.then(null, next);
});

router.put('/:id', function(req, res, next){
	//not sure using Date.now or Date.now()
	Category.findByIdAndUpdate(req.params.id, {modifiedDate: Date.now})
		.then(function(origCategory){
			var newCategory = new Category(req.body);
			newCategory.origId = origCategory._id;
			return newCategory.save();
		})
		.then(function(newCategory){
			res.send(newCategory);
		})
		.then(null, next);
});


router.delete('/:id', function(req, res, next){
	//not sure using Date.now or Date.now()
	Category.findByIdAndUpdate(req.params.id, {modifiedDate: Date.now}, {new: true})
		.then(function(deletedCategory){
			res.send(deletedCategory);
		})
		.then(null, next);
});







