'use strict';
var mongoose = require('mongoose');
var router = require('express').Router();
var models = require('../../../db/models');
var Order = models.Order;
module.exports = router;

//Note - Still need to implement access control!
router.get('/', function (req, res, next) {
	Order.find({})
	.then(function(orders){
		res.send(orders);
	})
	.then(null, next);
});

router.get('/:id', function(req, res, next){
	var id = req.params.id;
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

router.put('/:id', function(req, res, next){
	Order.findByIdAndUpdate(req.params.id, req.body, {new: true})
	.then(function(updatedOrder){
		var timestamped = updatedOrder.timestampStatus(updatedOrder.status);
		return timestamped.save();		
	})
	.then(function(timestampedOrder){
		res.send(timestampedOrder);
	})
	.then(null, next);
})

/* Do we even need a delete function? Aren't we just going to mark it as cancelled and keep it for records sake?
router.delete('/:id', function(req, res, next){
	Order.findByIdAndRemove(req.params.id)
	.then(function(deletedOrder){
		res.send(deletedOrder);
	})
	.then(null, next);
})
*/

