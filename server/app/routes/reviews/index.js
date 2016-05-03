'use strict'
var router = require('express').Router();
var mongoose = require('mongoose');
var Review = mongoose.model('Review');

module.exports = router;

//get all reviews, which might be unnecessary
router.get('/', function(req, res, next){
	Review.find()
		.then(function(reviews){
			res.send(reviews);
		})
		.then(null, next);
});

//no need to get a specific review

//find reviews by productId
router.get('/product/:productId', function(req, res, next){
	Review.find({product: req.params.productId})
		.then(function(reviews){
			res.send(reviews);
		})
		.then(null, next);
});

//find reviews by userId
router.get('/user/:userId', function(req, res, next){
	Review.find({user: req.params.userId})
		.then(function(reviews){
			res.send(reviews);
		})
		.then(null, next);
});

//delete this route because in product populate will take care of it
router.post('/', function(req, res, next){
	var newReview = new Review(req.body);
	newReview.origId = newReview._id;
	newReview.save()
		.then(function(review){
			res.send(review);
		})
		.then(null, next);
});

router.put('/:id', function(req, res, next){
	//not sure using Date.now or Date.now()
	Review.findByIdAndUpdate(req.params.id, {modifiedDate: Date.now})
		.then(function(origReview){
			var newReview = new Review(req.body);
			newReview.origId = origReview.origId;
			return newReview.save();
		})
		.then(function(newReview){
			res.send(newReview);
		})
		.then(null, next);	
});

//delete this route because in product populate will take care of it
router.delete('/:id', function(req, res, next){
	//not sure using Date.now or Date.now()
	Review.findByIdAndUpdate(req.params.id, {modifiedDate: Date.now}, {new: true})
		.then(function(deletedReview){
			res.send(deletedReview);
		})
		.then(null, next);
});
















