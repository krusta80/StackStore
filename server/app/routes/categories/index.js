'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Category = mongoose.model('Category');
var Product = mongoose.model('Product');
var authorization = require('../../configure/authorization-middleware.js')


module.exports = router;

var readWhitelist = {
	Any: ['name', 'description', '_id'],
	User: ['name', 'description', '_id'],
	Admin: ['name', 'description', '_id', 'origId', 'active', 'dateCreated', 'dateModified']
};

var writeWhitelist = {
	Any: [],
	User: [],
	Admin: ['name', 'description', 'active']
};

var updateCategories = function(products, oldCategory, newCategory) {
	return products.map(function(product) {
		var i;
		for(i = 0; i < product.categories.length; i++) {
			if(product.categories[i]._id+"" == oldCategory._id+"")
				break;
		}
			
		product.categories.splice(i,1);
		product.categories.push(newCategory);
		return product.save();
	});
};

router.get('/', function(req, res, next){
	Category.find({dateModified : {$exists : false }}).sort('name')
		.then(function(categories){
			res.send(categories);
		})
		.then(null, next);
});

//get fields
router.get('/fields', function(req, res, next){
	if(!req.user)
        res.send(readWhitelist.Any);
    res.send(readWhitelist[req.user.role]);
});

router.get('/:id', function(req, res, next){
	var id = req.params.id;
	Category.findById(id)
		.then(function(category){
			res.send(category);
		})
		.then(null, next);
});

router.get('/:origId/history', function(req, res, next){
	var origId = req.params.origId;
	Category.find({origId: origId}).sort('dateCreated')
		.then(function(history){
			res.send(history);
		})
		.then(null, next);
});

router.post('/', authorization.isAdmin, function(req, res, next){
	var newCategory = new Category(req.body);
	newCategory.origId = newCategory._id;
	newCategory.save()
		.then(function(category){
			res.send(category);
		})
		.then(null, next);
});

router.put('/:id', authorization.isAdmin, function(req, res, next){
	//not sure using Date.now or Date.now()
	var origCategory, newCategory;
	var err;
	Category.findByIdAndUpdate(req.params.id, {dateModified: Date.now()})
		.then(function(_origCategory){
			origCategory = _origCategory;
			delete req.body._id;
			delete req.body.__v;
			delete req.body.dateModified;
			delete req.body.dateCreated;
			
			newCategory = new Category(req.body);
			newCategory.origId = origCategory.origId;
			return newCategory.save();
		})
		.then(function(_newCategory){
			newCategory = _newCategory;
			return Product.find({categories: origCategory}).populate({path: 'categories'});
		})
		.then(function(products) {
			return Promise.all(updateCategories(products, origCategory, newCategory));
		})
		.then(function(products){
			res.send(newCategory);
		})
		.catch(function(_err){
			err =_err;
			console.log("ERROR: ", err);
			return Category.findByIdAndUpdate(req.params.id, {$unset: {dateModified: ""}})
		})
		.then(function(category) {
			if(err)
				res.status(500).send(err);
		})
		.then(null, next)

});


router.delete('/:id', authorization.isAdmin, function(req, res, next){
	//not sure using Date.now or Date.now()
	Category.findByIdAndUpdate(req.params.id, {dateModified: Date.now()}, {new: true})
		.then(function(deletedCategory){
			res.send(deletedCategory);
		})
		.then(null, next);
});







