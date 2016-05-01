'use strict'
var router = require('express').Router();
var mongoose = require('mongoose');
var Product = mongoose.model('Product');

module.exports = router;

//get all products, which might be unnecessary
router.get('/', function(req, res, next){
	Product.find()
		.then(function(products){
			res.send(products);
		})
		.then(null, next);
});

//get by category
router.get('/category/:categoryId', function(req, res, next){
	Product.find({categories: req.params.categoryId})
		.populate('categories')
		.then(function(products){
			res.send(products);
		})
		.then(null, next);
});

router.get('/:id', function(req, res, next){
	Product.findById(req.params.id)
		.then(function(product){
			res.send(product);
		})
		.then(null, next);
});

//at least make sure user is authenticate.. see members middleware
router.post('/', function(req, res, next){
	var newProduct = new Product(req.body);
	newProduct.origId = newProduct._id;//why?
	newProduct.save()
		.then(function(product){
			res.send(product);
		})
		.then(null, next);
});

router.put('/:id', function(req, res, next){
	//not sure using Date.now or Date.now()
	Product.findByIdAndUpdate(req.params.id, {modifiedDate: Date.now})
		.then(function(origProduct){
			var newProduct = new Product(req.body);
			newProduct.origId = origProduct.origId;
			return newProduct.save();
		})
		.then(function(newProduct){
			res.send(newProduct);
		})
		.then(null, next);
});

router.delete('/:id', function(req, res, next){
	//not sure using Date.now or Date.now()
  // Date.now and Date.now() do the same thing in this case... perhaps.. not totally sure..
  // I don't understand this third parameter.. { new: true }..
  // why not do yourself a favor and actually find what you are looking for and update it?
  // not sure what findByIdAndUpdate buys you...
	Product.findByIdAndUpdate(req.params.id, {modifiedDate: Date.now}, {new: true})
		.then(function(deletedProduct){
			res.send(deletedProduct);
		})
		.then(null, next);
});
