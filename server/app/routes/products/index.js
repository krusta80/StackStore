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

//get products that match search query
router.get('/search/:searchString', function(req, res, next){
	var findOptions = JSON.parse('{ "title" : { "$regex": \"'+req.params.searchString+'\", "$options": "i"}, "dateModified" : {"$exists" : false } }');
	Product.find(findOptions)
		.then(function(products){
			res.send(products);
		})
		.then(null, next);
});

//get by category
router.get('/category/:categoryId', function(req, res, next){
	Product.find({categories: req.params.categoryId, dateModified: {$exists : false}})
		.populate('categories')
		.then(function(products){
			res.send(products);
		})
		.then(null, next);
});

router.get('/:id', function(req, res, next){
	var id = req.params.id;
	Product.findById(id)
		//nested populate
		.populate({
			path: 'reviews',
			populate: {
				path: 'user'
			}
		})
		.then(function(product){
			res.send(product);
		})
		.then(null, next);
});

router.post('/', function(req, res, next){
	var newProduct = new Product(req.body);
	newProduct.origId = newProduct._id;
	newProduct.save()
		.then(function(product){
			res.send(product);
		})
		.then(null, next);
});

router.put('/:id', function(req, res, next){
	Product.findByIdAndUpdate(req.params.id, {dateModified: Date.now()})
		.then(function(origProduct){
			var origId = req.body._id;
			delete req.body._id;
			delete req.body.__v;
			delete req.body.dateCreated;

			req.body.averageStars = 0;
			req.body.reviews.forEach(function(review) {
				req.body.averageStars += review.stars;
			});
			req.body.averageStars /= req.body.reviews.length;

			var newProduct = new Product(req.body);
			newProduct.origId = origId;
			return newProduct.save();
		})
		.then(function(newProduct){
			res.send(newProduct);
		})
		.then(null, next);
});

router.delete('/:id', function(req, res, next){
	Product.findByIdAndUpdate(req.params.id, {dateModified: Date.now()}, {new: true})
		.then(function(deletedProduct){
			res.send(deletedProduct);
		})
		.then(null, next);
});











