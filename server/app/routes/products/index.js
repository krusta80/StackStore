'use strict'
var router = require('express').Router();
var mongoose = require('mongoose');
var Product = mongoose.model('Product');
var Category = mongoose.model('Category');
var authorization = require('../../configure/authorization-middleware.js')

module.exports = router;

var readWhitelist = {
	Any: ['title', 'description', 'imageUrls', 'reviews', 'averageStars', 'categories', 'reviews', 'price', 'inventoryQty', '_id'],
	User: ['title', 'description', 'imageUrls', 'reviews', 'averageStars', 'categories', 'reviews', 'price', 'inventoryQty', '_id'],
	Admin: ['title', 'description', 'imageUrls', 'reviews', 'averageStars', 'categories', 'reviews', 'price', 'inventoryQty', 'active', 'origId', '_id', 'dateCreated', 'dateModified']
};

var writeWhitelist = {
	Any: [],
	User: ['reviews'],
	Admin: ['title', 'description', 'imageUrls', 'reviews', 'averageStars', 'categories', 'reviews', 'price', 'inventoryQty', 'active']
};

var filterCategories = function(product) {
	return product.categories.map(function(category) {
		return Category.findOne({dateModified : {$exists : false }, origId: category.origId});
	});
};


//get fields
router.get('/fields', function(req, res, next){
	if(!req.user)
        res.send(readWhitelist.Any);
    res.send(readWhitelist[req.user.role]);
});

//get all products, which might be unnecessary
router.get('/', function(req, res, next){
	Product.find({dateModified : {$exists : false }}).sort({title: 1, price: 1})
		.then(function(products){
			res.send(products);
		})
		.then(null, next);
});

router.get('/:origId/history', function(req, res, next){
	var origId = req.params.origId;
	Product.find({origId: origId}).sort('dateCreated')
		.then(function(history){
			res.send(history);
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
			console.log(products.length, "products found");
			res.send(products);
		})
		.then(null, function(err) {
			console.log(err);
			next();
		});
});

router.get('/:id', function(req, res, next){
	var id = req.params.id;
	var product;
	Product.findById(id)
		//nested populate
		.populate({
			path: 'reviews',
			populate: {
				path: 'user'
			}
		})
		.populate({
			path: 'categories'
		})
		.then(function(_product){
			product = _product;
			//	updating categories
			return Promise.all(filterCategories(product));
		})
		.then(function(categories){
			product.categories = categories;
			res.send(product);
		})
		.then(null, next);
});

router.post('/', authorization.isAdmin, function(req, res, next){
	var newProduct = new Product(req.body);
	newProduct.origId = newProduct._id;
	newProduct.save()
		.then(function(product){
			res.send(product);
		})
		.then(null, next);
});

router.put('/:id', function(req, res, next){
	Product.findById(req.params.id)
		.populate({
				path: 'reviews',
				populate: {
					path: 'user'
				}
			})
			.populate({
				path: 'categories'
			})
		.then(function(origProduct){
			var origId = req.body._id;
			delete req.body._id;
			delete req.body.__v;
			delete req.body.dateCreated;

			req.body.averageStars = 0;
			req.body.reviews.forEach(function(review) {
				req.body.averageStars += review.stars;
			});
			if(req.body.reviews.length > 0)
				req.body.averageStars /= req.body.reviews.length;

			var newProduct = new Product(req.body);
			newProduct.dateModified = Date.now();
			newProduct.origId = origId;
			return newProduct.save();
		})
		.then(function(newProduct){
			res.send(newProduct);
		})
		.then(null, next);
});

router.delete('/:id', authorization.isAdmin, function(req, res, next){
	Product.findByIdAndUpdate(req.params.id, {dateModified: Date.now()}, {new: true})
		.then(function(deletedProduct){
			res.send(deletedProduct);
		})
		.then(null, next);
});











