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
	var id = req.session.cartId;//are you storing non-logged in users cartson the server? that could get messy..
	console.log("session cart id", id);
	Order.findById(id)
	.then(function(order){
		res.send(order);
	})
	.then(null, next);
})

router.get('/:id', function(req, res, next){
	var id = req.params.id;
	Order.findById(id).populate('lineItems.prod_id')
	.then(function(order){
		res.send(order);
	})
	.then(null, next);
})

//why is this route here twice?
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

//the general way this is usually solved is that for a logged in user a Cart is just an order in the Cart state... while for a non logged in user, the cart is only persisted client side until they log in.
router.put('/myCart', function(req, res, next) {
	Order.findById(req.session.cartId)
	.then(function(fetchedOrder){
		delete req.body.dateCreated;

		for(var key in req.body){
			fetchedOrder[key] = req.body[key];
	    }

	    return fetchedOrder.save();
	})
	.then(function(savedOrder) {
		res.send(savedOrder);
	})
	.then(null, next);
});

router.put('/:id', function(req, res, next){

	Order.findById(req.params.id)
	.then(function(fetchedOrder){
		//Most values can only be edited while in the 'Cart' stage
		if(fetchedOrder.status !== 'Cart'){
			delete req.body.userId; delete req.body.sessionId;
			delete req.body.email;
			delete req.body.invoiceNumber; delete req.body.lineItems;
			delete req.body.shippingAddress; delete req.body.billingAddress;
		}

		//User may not edit timestamps directly under any circumstances
		["Created", 'Ordered', "Notified", "Shipped", "Delivered", "Canceled"].forEach(function(state){
			delete req.body["date"+state];
		})

		//Order status can only go "forward"
		var states = Order.schema.path('status').enumValues;
		if(states.indexOf(req.body.status) < states.indexOf(fetchedOrder.status)){
			delete req.body.status
		}

		//Finally, update values and timestamp
		for(var key in req.body){
			fetchedOrder[key] = req.body[key];
	    }

	    var fetchedOrder = fetchedOrder.timestampStatus();
	    return fetchedOrder.save();
	})
	.then(function(updatedOrder){
		res.send(updatedOrder);
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




