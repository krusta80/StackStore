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

//added by CK on 5/4 to retrieve historical orders
router.get('/myOrders/:userId', function(req, res, next){
	Order.find({userId: req.params.userId, status: { $not: /^Cart.*/}})//filters out orders in status "Cart"
	.populate('lineItems.prod_id')
	.populate('shippingAddress')
	.then(function(orders){
		res.send(orders);
	})
	.catch(function(err){
		console.log("ERR:", err)
	})
})

//	added by JAG on 04/25/16 for cart-related stuff
router.get('/myCart', function(req, res, next){
	if(!req.session.cartId) {
		console.log("No cart found for this session...creating one now.");
        Order.create({
            sessionId: req.cookies['connect.sid'],
            status: 'Cart',
            dateCreated: Date.now()
        })
        .then(function(cart) {
            req.session.cartId = cart._id;
            res.send(cart);
        })
        .catch(function(err) {
            console.log("ERROR:",err);
        });
	}
	else {
		var id = req.session.cartId;
	
		console.log("session cart id", id);
		Order.findById(id)
		.then(function(order){
			res.send(order);
		})
		.then(null, next);	
			
	}
})

router.get('/:id', function(req, res, next){
	var queryPromise = Order.findById(req.params.id)
						.populate({
							path: 'lineItems.prod_id',
							model: 'Product',
							populate: {
								path: 'categories',
								model: 'Category'
							}
						});

	if(req.user)
		queryPromise = Order.findOne({userId: req.user._id, status: 'Cart'})
						.populate({
							path: 'lineItems.prod_id',
							model: 'Product',
							populate: {
								path: 'categories',
								model: 'Category'
							}
						});

	queryPromise
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
	var queryPromise;
	if(req.user)
		queryPromise = Order.findOne({userId: req.user._id, status: 'Cart'});
	else
		queryPromise = Order.findById(req.session.cartId);

	queryPromise
	.then(function(fetchedOrder){
		if(req.cookies['connect.sid'] === fetchedOrder.sessionId) {
			delete req.body.dateCreated;
			delete req.body.__v;
			
			for(var key in req.body){
				fetchedOrder[key] = req.body[key];
		    }
		}
		else {
			req.session.cartId = fetchedOrder.id	
			fetchedOrder.sessionId = req.cookies['connect.sid'];
		}
		return fetchedOrder.save();
	})
	.then(function(savedOrder) {
		res.send(savedOrder);
	})
	.catch(next);
});

router.put('/:id', function(req, res, next){

	Order.findById(req.params.id)
	.then(function(fetchedOrder){
		delete req.body.__v;
			
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




