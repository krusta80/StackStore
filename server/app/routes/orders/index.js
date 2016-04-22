'use strict';
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
	Order.create(req.body)
	.then(function(newOrder){
		res.send(newOrder);
	})
	.then(null, next);
})

router.put('/:id', function(req, res, next){
	// Need to DELETE certain fields and configure access control.
	Order.findByIdAndUpdate(req.params.id, req.body, {new: true})
	.then(function(updatedOrder){
		res.send(updatedOrder);
	})
	.then(null, next);
})

router.delete('/:id', function(req, res, next){
	Order.findByIdAndRemove(req.params.id)
	.then(function(deletedOrder){
		res.send(deletedOrder);
	})
	.then(null, next);
})