'use strict';
var mongoose = require('mongoose');
var router = require('express').Router();
var models = require('../../../db/models');
var Order = models.Order;
module.exports = router;


//Routes
router.get('/', function (req, res, next) {
	Order.find({})
	.then(function(orders){
		res.send(orders);
	})
	.then(null, next);
});

//	added by JAG on 04/25/16 for cart-related stuff
router.get('/myCart', function(req, res, next){
	var id = req.session.cartId;
	console.log("session cart id", id);
	Order.findById(id)
	.then(function(order){
		res.send(order);
	})
	.then(null, next);
})

router.get('/:id', function(req, res, next){
	var id = req.params.id;
	Order.findById(id)
	.then(function(order){
		res.send(order);
	})
	.then(null, next);
})

router.get('/myCart', function(req, res, next){
	var id = req.session.cartId;
	console.log("session cart id", id);
	Order.findById(id)
	.then(function(order){
		res.send(order);
	})
	.then(null, next);
})

router.post('/', function(req, res, next){
	if(req.body.status !== 'Cart'){
		res.send("In order to POST to /api/order, status must be Cart");
	}

	Order.create(req.body)
	.then(function(newOrder){
		newOrder.timestampStatus('created');
		res.send(newOrder);
	})
	.then(null, next);
})

router.put('/myCart', function(req, res, next) {
	Order.findById(req.session.cartId)
	.then(function(fetchedOrder){
		delete req.body.dateCreated;

		for(var key in req.body){
			fetchedOrder[key] = req.body[key];
	    }

	    res.send(fetchedOrder);
	})
	.then(null, next);
});

router.put('/:id', function(req, res, next){
	Order.findById(req.params.id)
	.then(function(fetchedOrder){
		if(fetchedOrder.status !== 'Cart'){
			delete req.body.userId;
			delete req.body.sessionId;
			delete req.body.email;
			delete req.body.lineItems;
			delete req.body.invoiceNumber;
			delete req.body.shippingAddress;
			delete req.body.billingAddress;
			if(req.body.status === 'Cart'){
				delete req.body.status
			}
			delete req.body.dateCreated;
		}

		//Future Implementation:
		//Create array of states <- This is the order
		//With helper function, make sure state can only change to something "after" current state
		//Also lock in timestamps.

		for(var key in req.body){
			fetchedOrder[key] = req.body[key];
	    }

	    return fetchedOrder.save();
	})
	.then(function(updatedOrder){
		var timestamped = updatedOrder.timestampStatus(updatedOrder.status);
		return timestamped.save(); //Maybe more efficient to use findByID and save once.
	})
	.then(function(timestampedOrder){
		res.send(timestampedOrder);
	})
	.then(null, next);
})

//Do we even need a delete function? Aren't we just going to mark it as cancelled and keep it for records sake?
router.delete('/:id', function(req, res, next){
	Order.findByIdAndRemove(req.params.id)
	.then(function(deletedOrder){
		res.send(deletedOrder);
	})
	.then(null, next);
})




