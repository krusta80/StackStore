// Instantiate all models
var mongoose = require('mongoose');
require('../../../server/db/models');

var Category = mongoose.model('Category');
var Product = mongoose.model('Product');
var Order = mongoose.model('Order');
var User = mongoose.model('User');

var expect = require('chai').expect;

var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var supertest = require('supertest');
var app = require('../../../server/app');

var cloneOrderFields = function(order) {
	return {
		userId: order.userId,
		sessionId: order.sessionId,
		email: order.email,
		lineItems: order.lineItems.map(function(lineItem){return lineItem;}),
		invoiceNumber: order.invoiceNumber,
		shippingAddress: order.shippingAddress,
		billingAddress: order.billingAddress,
		status: order.status,
		dateCreated: order.dateCreated
	};
};

var seedUsers = function () {

    var users = [
        {
            email: 'jag47@cornell.edu',
            password: 'potus',
            firstName: 'John',
            lastName: 'Gruska',
            middleName: 'Anthony',
            role: 'Admin',
            active: true,
            pendingPasswordReset: false,
            dateCreated: Date.now()
        }
    ];

    return User.create(users);
};

var seedCategories = function () {

    var categories = [
        {
            name: 'Test Category',
            dateCreated: Date.now()
        }
    ];

    return Category.create(categories);
};

var seedProducts = function (categoryId) {

    var products = [
        {
            title: 'Test Product',
            categories: [categoryId],
            price: 5,
            inventoryQty: 10,
            active: true,
            dateCreated: Date.now()
        }
    ];

    return Product.create(products);
};

var seedOrders = function (product) {

    var orders = [
        {
            sessionId: '123',
			email: 'krusta80@aol.com',
            lineItems: [{prod_id: product._id, qty: product.inventoryQty, price: product.price}],
			invoiceNumber: 'INV#00001',
			status: 'Ordered',
			dateCreated: Date.now()
        },
        {
            sessionId: '321',
			email: 'jag47@cornell',
            lineItems: [{prod_id: product._id, qty: product.inventoryQty, price: product.price}],
			invoiceNumber: 'INV#00002',
			status: 'Shipped',
			dateCreated: Date.now()
        },
        {
            sessionId: '231',
			email: 'johngruska@gmail.com',
            lineItems: [{prod_id: product._id, qty: product.inventoryQty, price: product.price}],
			invoiceNumber: 'INV#00003',
			status: 'Canceled',
			dateCreated: Date.now()
        }
    ];

    return Order.create(orders);
};

var loggedInAgent;
var testOrders;
var testProduct;

describe('Orders Route', function () {

	beforeEach('Establish DB connection', function (done) {
		if (!mongoose.connection.db) 
			mongoose.connect(dbURI);

		//	seed the db
		seedUsers()
		.then(seedCategories)
		.then(function(categories) {
			return seedProducts(categories[0]._id);
		})
		.then(function(products) {
			testProduct = products[0];
			return seedOrders(testProduct);
		})
		.then(function(orders) {
			testOrders = orders;
			
			// log in 
			loggedInAgent = supertest.agent(app);
			loggedInAgent.post('/login').send({email: 'jag47@cornell.edu', password: 'potus'}).end(done);
		});
	});

	afterEach('Clear test database', function (done) {
		clearDB(done);
	});

	describe('/get', function () {
		describe('- all', function () {
			var response;

			beforeEach('Execute get request', function (done) {
				loggedInAgent.get('/api/orders')
				.end(function(err, res) {
					response = res;
					done();
				});
			});
	
			it('should get with 200 response', function (done) {
				expect(response.statusCode).to.equal(200);
				done();
			});

			it('should respond with an array of length 3', function (done) {
				expect(response.body.length).to.equal(3);
				done();
			});
		});

		describe('- by ID', function () {
			var response;
			var testOrder;

			beforeEach('Execute get request', function (done) {
				testOrder = testOrders[0];
				loggedInAgent.get('/api/orders/'+testOrder._id)
				.end(function(err, res) {
					response = res;
					done();
				});
			});
	
			it('should get with 200 response', function (done) {
				expect(response.statusCode).to.equal(200);
				done();
			});

			it('should respond with the correct order', function (done) {
				var isGood = Object.keys(response.body).reduce(function(bool, field) {
					if(field === 'dateCreated')
						return true;
					if(field === 'lineItems'){
						var responseLineItemsArr = response.body['lineItems'];
						var testLineItemsArr = testOrder['lineItems'];

						if(responseLineItemsArr.length !== testLineItemsArr.length){
							return false;
						}

						for(var i = 0; i < responseLineItemsArr.length; i++){

							var responseLineItem = responseLineItemsArr[i];
							var testLineItem = testLineItemsArr[i];

							for(var key in responseLineItem){
								if(String(responseLineItem[key]) !== String(testLineItem[key])){
									return false;
								}
							}

						}

						return true;
					}
					return bool && (response.body[field] == testOrder[field])
				}, true);
				expect(isGood).to.equal(true);
				done();
			});
		});
	});

	describe('/post', function () {	
		var response;
		var newOrder;

		beforeEach('Execute post request', function (done) {
			newOrder = {
		        sessionId: '999',
				email: 'david@yang.org',
		        lineItems: [{prod_id: testProduct._id, qty: testProduct.inventoryQty, price: testProduct.price}],
				status: 'Cart',
				dateCreated: Date.now()
		    };

			loggedInAgent.post('/api/orders').send(newOrder)
			.end(function(err, res) {
				response = res;
				done();
			});
		});

		it('should post with 200 response', function (done) {
			expect(response.statusCode).to.equal(200);
			done();
		});

		it('should create and respond with the new order', function (done) {
			var isGood = Object.keys(newOrder).reduce(function(bool, field) {
				if(field === 'dateCreated')
					return true;
				return bool && (response.body[field] == newOrder[field]);
			}, true);
			expect(isGood && response.body._id).to.equal(true);
			done();
		});
	});

	describe('/put', function () {	
		var response;
		var origOrder, modifiedOrder;
		var orderFields;
		
		beforeEach('Execute put request', function (done) {
			origOrder = testOrders[1];
			modifiedOrder = cloneOrderFields(origOrder);
			modifiedOrder.status = 'Delivered';

			orderFields = Object.keys(modifiedOrder);
			
			loggedInAgent.put('/api/orders/'+origOrder._id).send(modifiedOrder)
			.end(function(err, res) {
				response = res;
				done();
			});
		});

		it('should put with 200 response', function (done) {
			expect(response.statusCode).to.equal(200);
			done();
		});

		it('should update the existing order', function (done) {
			expect(response.body._id).to.equal(origOrder._id);
			done();
		});

		it('should respond with the modified details', function (done) {
			var isGood = orderFields.reduce(function(bool, field) {
				if(field === 'dateCreated')
					return true;
				return bool && (response.body[field] == modifiedOrder[field]);
			}, true);
			expect(isGood).to.equal(true);
			done();
		});
	});

	describe('/delete', function () {	
		var response;
		var origOrder;
		var orderFields;
		var wasDeleted;

		beforeEach('Execute delete request', function (done) {
			origOrder = testOrders[1];
			var deletedOrder = cloneOrderFields(origOrder);
			orderFields = Object.keys(deletedOrder);
			
			loggedInAgent.delete('/api/orders/'+origOrder._id)
			.end(function(err, res) {
				response = res;
				Order.findById(origOrder._id)
				.then(function(order) {
					wasDeleted = false;
					done();
				})
				.catch(function(err) {
					wasDeleted = true;
					done();
				});
			});
		});

		it('should put with 200 response', function (done) {
			expect(response.statusCode).to.equal(200);
			done();
		});

		it('should respond with the deleted id', function (done) {
			expect(response.body._id).to.equal(origOrder._id);
			done();
		});

		it('should no longer exist in the db', function (done) {
			expect(wasDeleted).to.equal(true);
			done();
		});
	});
});
