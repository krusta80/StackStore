'use strict';
var mongoose = require('mongoose');
var Promise = require('bluebird');
var router = require('express').Router();
var models = require('../../../db/models');
var Order = models.Order;
var User = models.User;
var Address = models.Address;
var Product = models.Product;
var authorization = require('../../configure/authorization-middleware.js');
var mail = require('../../../mail');
module.exports = router;

var readWhitelist = {
    Any: ['_id', 'invoiceNumber', 'email', 'sessionId', 'lineItems', 'shippingAddress', 'billingAddress', 'status', 'dateCreated', 'dateOrdered', 'dateNotified', 'dateShipped', 'dateDelivered', 'dateCanceled'],
    User: ['_id', 'invoiceNumber', 'email', 'userId', 'sessionId',  'lineItems', 'shippingAddress', 'billingAddress', 'status', 'dateCreated', 'dateOrdered', 'dateNotified', 'dateShipped', 'dateDelivered', 'dateCanceled'],
    Admin: ['_id', 'invoiceNumber', 'email', 'userId', 'sessionId', 'lineItems', 'shippingAddress', 'billingAddress', 'status', 'dateCreated', 'dateOrdered', 'dateNotified', 'dateShipped', 'dateDelivered', 'dateCanceled'],
};

var writeWhitelist = {
    Any: ['lineItems', 'shippingAddress', 'billingAddress'],
    User: ['lineItems', 'shippingAddress', 'billingAddress'],
    Admin: ['_id', 'invoiceNumber', 'email', 'userId', 'sessionId',  'lineItems', 'shippingAddress', 'billingAddress', 'status', 'dateCreated', 'dateOrdered', 'dateNotified', 'dateShipped', 'dateDelivered', 'dateCanceled'],
};

var findCart = function(req) {
	return Order.findById(req.session.cartId).populate({
							path: 'lineItems.prod_id',
							model: 'Product',
							populate: {
								path: 'categories',
								model: 'Category'
							}
						})
						.populate({path: 'billingAddress'})
						.populate({path: 'shippingAddress'});
}

var removeAddresses = function(addressIds) {
	return Promise.all(addressIds.map(function(addressId) {
		console.log("removing address id", addressId);
		return Address.findByIdAndUpdate(addressId, {dateModified: Date.now()})
	}));
};

var rollBackInventory = function(order) {
	var rollbacks = order.lineItems.map(function(lineItem) {
			console.log("   rolling back: ", lineItem.prod_id.title, lineItem.quantity);
			return Product.findOneAndUpdate({
				origId: lineItem.prod_id.origId, 
				dateModified: {$exists: false}
			}, {
				$inc: {inventoryQty: lineItem.quantity}
			}, {
				new: true
			});
		});
	return Promise.all(rollbacks);
};

var grabInventory = function(cart) {
	var promises = cart.lineItems.map(function(lineItem) {
		console.log("grabInventory -> origId:", lineItem.prod_id.origId);
		return Product.findOneAndUpdate({
			origId: lineItem.prod_id.origId, 
			dateModified: {$exists: false}
		}, {
			$inc: {inventoryQty: -1*lineItem.quantity}
		}, {
			new: true
		});
	});

	var index = 0;	
	var errorMsg = "";
	return Promise.settle(promises)
	.then(function(inspections) {
		inspections.forEach(function(inspection) {
			if(inspection.value().inventoryQty < 0) 
		        errorMsg += "Not enough inventory for item: "+cart.lineItems[index].prod_id.title+'\n';
		    index++;
		})
		return true;
	})
	.then(function() {
		if(errorMsg.length === 0) {	
			console.log("Inventory grabbed successfully!");
			return "ALL GOOD";
		}
		console.log("pre rollback loop");
		return rollBackInventory(cart);
	})
	.then(function(result) {
		console.log("result is", result);
		if(result === 'ALL GOOD')
			return;
		else
			throw errorMsg;
	})
};

var updateAddresses = function(order) {
	var promises = [];
	if(typeof order.billingAddress === 'object') {
		console.log(order.billingAddress);
		delete order.billingAddress._id;
		var billing = new Address(order.billingAddress);
		promises.push(billing.save());
	}
	if(typeof order.shippingAddress === 'object') {
		delete order.shippingAddress._id;
		var shipping = new Address(order.shippingAddress);
		promises.push(shipping.save());
	}
	return Promise.all(promises)
		.then(function(newAddresses) {
			console.log("added address id", newAddresses[0]._id);
			console.log("added address id", newAddresses[1]._id);
			order.billingAddress = newAddresses[0];
			order.shippingAddress = newAddresses[1];
			return order;
		});
};

//Route Params
router.param('id', function(req, res, next, id){
    Order.findById(id).exec()
    .then(function(order){
        if(!order) 
        	return res.status(404).send({});
        req.requestedObject = order;
        console.log("setting requestedObject", req.requestedObject);
        if(order.userId){
            User.findById(order.userId)
            .then(function(user){
                if(!user) res.status(404).send();
                req.requestedUser = user;
                next();
            })
        }else{
            next();
        }
    })
    .then(null, next);
})

router.param('userId', function(req, res, next, id){
	console.log("USER ID", id);
    User.findById(id).exec()
    .then(function(user){
        if(!user) res.status(404).send();
        req.requestedUser = user;
        next();
    })
    .then(null, next);
})


//Routes
router.get('/', function (req, res, next) {
	Order.find({})
	.then(function(orders){
		res.send(orders);
	})
	.then(null, next);
});

router.get('/fields', function(req, res, next) {
	if(!req.user)
        res.send(readWhitelist.Any);
    res.send(readWhitelist[req.user.role]);
});

//added by CK on 5/4 to retrieve historical orders
router.get('/myOrders', function(req, res, next){
	Order.find({userId: req.user._id, status: { $not: /^Cart.*/}})//filters out orders in status "Cart"
	.populate('lineItems.prod_id')
	.populate('shippingAddress')
	.populate('billingAddress')
	.then(function(orders){
		res.send(orders);
	})
	.catch(function(err){
		console.log("ERR:", err)
	})
})

router.get('/pastOrders/:key', function(req, res, next) {
    console.log("In past order route...");
    Order.findOne({pastOrderKey: req.params.key})
    	.populate({
			path: 'lineItems.prod_id',
			model: 'Product',
			populate: {
				path: 'categories',
				model: 'Category'
			}
		})
		.populate({path: 'billingAddress'})
		.populate({path: 'shippingAddress'})

    .then(function(order) {
        console.log("past order found...", order);
        res.send(order);
    })
    .catch(function(err) {
        console.log("Error when trying to grab past order!", err);
        next();
    });
});

//	added by JAG on 04/25/16 for cart-related stuff
//    added by JAG on 04/25/16 for cart-related stuff
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
            next();
        });
    }
    else {
        var id = req.session.cartId;
    
        console.log("session cart id", id);
        Order.findById(id)
        .populate({
        	path: 'lineItems.prod_id',
        	model: 'Product',
        	populate: {
        		path: 'categories',
        		model: 'Category'
        	}
        })
        .then(function(order){
        	if(!order)
        		return Order.create({
		            sessionId: req.cookies['connect.sid'],
		            status: 'Cart',
		            dateCreated: Date.now()
		        })
        	else
            	return order;
        })
        .then(function(cart) {
            req.session.cartId = cart._id;
            res.send(cart);
        })
        .then(null, function(err) {
        	console.log("error is", err);
        	next();
        });    
    }
})

router.get('/:id', authorization.isAdminOrOwner, function(req, res, next){
	var queryPromise = Order.findById(req.params.id)
						.populate({
							path: 'lineItems.prod_id',
							model: 'Product',
							populate: {
								path: 'categories',
								model: 'Category'
							}
						})
						.populate({path: 'billingAddress'})
						.populate({path: 'shippingAddress'})
						
	queryPromise
	.then(function(order){
		res.send(order);
	})
	.then(null, next);
})

router.get('/cartByUser/:userId', authorization.isAdminOrSelf,function(req, res, next) {
    if(req.user && (req.user.role === 'Admim' || req.user._id === req.params.userId))
        Order.findOne({userId: req.params.userId, status: 'Cart'}).populate({path: 'lineItems.prod_id'})
        .then(function(order){
            res.send(order);
        })
        .then(null, next);
    next();
});

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
	findCart(req)
	.then(function(fetchedOrder){
		console.log("trying to save to cart:", fetchedOrder, req.cookies, req.session);
		if(!fetchedOrder.sessionId || req.cookies['connect.sid'] === fetchedOrder.sessionId) {
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

router.put('/myCart/submit', function(req, res, next) {
	var whiteList = ['email', 'lineItems', 'shippingAddress', 'billingAddress'];
	var foundCart;

	findCart(req)
	.then(function(_foundCart) {
		foundCart = _foundCart;
		return grabInventory(foundCart);
	})
	.catch(function(err) {
		//	Error grabbing inventory!!
		console.log("INVENTORY ERROR", err);
		throw {message: err};
	})
	.then(function() {
		if(req.user)
			req.body.email = req.user.email;
		console.log("whiteList", whiteList);
		whiteList.forEach(function(field) {
			foundCart[field] = req.body[field];
		});
		foundCart.status = 'Ordered';
		foundCart.invoiceNumber = 'INV000'+ Math.random().toString(10).slice(3,8);
		foundCart.pastOrderKey = Math.random().toString(36).slice(3,12);
		console.log("foundCart (pre save)", foundCart);
		return foundCart.save();
	})
	.then(function(placedOrder) {
		delete req.session.cartId;
		mail.sendOrderConfirmation(placedOrder.email, placedOrder);
		res.send(placedOrder);
	})
	.catch(function(err) {
		console.log("Error submitting cart!", err);
		if(err.message.indexOf("user ID or email") > 0)
			err = {message: "Email address required for guest checkouts!"};
		res.status(500).send(err);
	});	
});

router.put('/myOrders/cancel/:orderId', function(req, res, next) {
	var thisUser = {_id: -1, role: 'User'};
	if(req.user)
		thisUser = req.user;
	
	var order;
	var isGood = false;
	
	Order.findById(req.params.orderId)
		.populate({
			path: 'lineItems.prod_id',
			model: 'Product',
			populate: {
				path: 'categories',
				model: 'Category'
			}
		})
		.populate({path: 'billingAddress'})
		.populate({path: 'shippingAddress'})
	.then(function(_order) {
		order = _order;
		//console.log(order, thisUser);
		if(thisUser.role !== 'Admin' && String(order.userId) !== String(thisUser._id) && (!order.pastOrderKey || req.body.pastOrderKey !== order.pastOrderKey))
			return res.status(401).send({message: "Unauthorized!"});
		else if(order.status !== 'Ordered')
			return res.status(401).send({message: "Can only cancel if status is Ordered"});
		else {
			isGood = true;
			order.status = 'Canceled';	
			return rollBackInventory(order);
		}
	})
	.then(function() {
		return order.save();
	})
	.then(function(order) {
		if(isGood)
			res.send(order);
	})
	.catch(function(err) {
		console.log("error is", err);
		next();
	})
});

router.put('/:id', authorization.isAdmin, function(req, res, next){
	var fetchedOrder;
	var updatedBody;
	var oldAddressIds = [req.body.billingAddress._id, req.body.shippingAddress._id];
	Order.findById(req.params.id)
	.then(function(_fetchedOrder){
		fetchedOrder = _fetchedOrder;
		delete req.body.__v;
	
		//User may not edit timestamps directly under any circumstances
		["Created", 'Ordered', "Notified", "Shipped", "Delivered", "Canceled"].forEach(function(state){
			delete req.body["date"+state];
		})

		return updateAddresses(req.body);
	})
	.then(function(_updatedBody){
		updatedBody = _updatedBody;
		console.log("updatedBody:", updatedBody);
		return removeAddresses(oldAddressIds);
	})
	.then(function(){
		req.body = updatedBody;
		//Finally, update values
		for(var key in req.body){
			fetchedOrder[key] = req.body[key];
	    }

	    return fetchedOrder.save();
	})
	.then(function(updatedOrder){
		res.send(updatedOrder);
	})
	.then(null, function(err) {
		console.log("Error with order put:", err);
		res.status(500).send(err);
	});
})

//Do we even need a delete function? Aren't we just going to mark it as cancelled and keep it for records sake?
router.delete('/:id', authorization.isAdmin, function(req, res, next){
	Order.findByIdAndRemove(req.params.id)
	.then(function(deletedOrder){
		res.send(deletedOrder);
	})
	.then(null, next);
})




