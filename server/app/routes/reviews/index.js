'use strict'
var router = require('express').Router();
var mongoose = require('mongoose');
var Review = mongoose.model('Review');
var User = mongoose.model('User');
var authorization = require('../../configure/authorization-middleware.js')

module.exports = router;

var readWhitelist = {
    Any: ['product', 'user', 'title', 'stars', 'description', 'dateCreated', 'productName', 'userEmail'],
    User: ['product', 'user', 'title', 'stars', 'description', 'dateCreated', 'productName', 'userEmail'],
    Admin: ['productName', 'userEmail', 'product', 'user', 'title', 'stars', 'description', 'dateCreated', '_id', 'origId'],
};

var writeWhitelist = {
    Any: [],
    User: ['product', 'user', 'title', 'stars', 'description', 'productName', 'userEmail'],
    Admin: ['product', 'user', 'title', 'stars', 'description', 'dateCreated', 'productName', 'userEmail'],
};

//Fields
router.get('/fields', function(req, res, next){
	if(!req.user)
        res.send(readWhitelist.Any);
    res.send(readWhitelist[req.user.role]);
});

//Req Params
router.param('id', function(req, res, next, id){
    Review.findById(id).exec()
    .then(function(review){
        if(!review) res.status(404).send();
        req.requestedObject = review;
        if(review.user){
            User.findById(review.user)
            .then(function(user){
                if(!user) res.status(404).send();
                req.requestedUser = user;
                next();
            })
        }else{
            next();
        }

        
    })
    .then(next, null);
})


//get all reviews, which might be unnecessary
router.get('/', function(req, res, next){
	Review.find({dateModified : {$exists : false }}).sort({product: 1, user: 1})
		.then(function(reviews){
			res.send(reviews);
		})
		.then(null, next);
});

router.get('/:origId/history', function(req, res, next){
	var origId = req.params.origId;
	Review.find({origId: origId}).sort('dateCreated')
		.then(function(history){
			res.send(history);
		})
		.then(null, next);
});

//Get a specific review
router.get('/:id', function(req, res, next){
	Review.findById(req.params.id).populate({path: 'product', path: 'user'})
		.then(function(review){
			res.send(review);
		})
		.then(null, next);	
});

//find reviews by productId
router.get('/product/:id', function(req, res, next){
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
	req.body.productName = req.body.product.title;
	req.body.userEmail = req.body.user.email;
	var newReview = new Review(req.body);
	newReview.user = req.user._id;
	newReview.origId = newReview._id;
	newReview.save()
		.then(function(review){
			res.send(review);
		})
		.then(null, next);
});



router.put('/:id', authorization.isAdminOrAuthor, function(req, res, next){
	req.body.productName = req.body.product.title;
	req.body.userEmail = req.body.user.email;
	Review.findByIdAndUpdate(req.params.id, {dateModified: Date.now()})
		.then(function(origReview){
			var origId = req.body.origId;
			delete req.body._id;
			delete req.body.__v;
			delete req.body.dateCreated;
			var newReview = new Review(req.body);
			newReview.origId = origId;
			return newReview.save();
		})
		.then(function(newReview){
			res.send(newReview);
		})
		.then(null, next);	
});

//delete this route because in product populate will take care of it
router.delete('/:id', authorization.isAdminOrAuthor, function(req, res, next){
	Review.findByIdAndUpdate(req.params.id, {dateModified: Date.now()}, {new: true})
		.then(function(deletedReview){
			res.send(deletedReview);
		})
		.then(null, next);
});













