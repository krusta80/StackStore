var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var settle = require('promise-settle');

// Require in all models.
require('../../../server/db/models');

var Order = mongoose.model('Order');
var User = mongoose.model('User');
var Category = mongoose.model('Category');
var Product = mongoose.model('Product');
var Address = mongoose.model('Address');

var generateNewOrder = function(userId, product, addressId) {
    return new Order({
        userId: userId,
        email: 'jag47@cornell.edu',
        lineItems: [{prod_id: product._id, quantity: product.inventoryQty, price: product.price}],
        invoiceNumber: 'JG000001',
        shippingAddress: addressId,
        billingAddress: addressId,
        status: 'Ordered',
        dateCreated: Date.now()
    });
};

var generateIncompleteOrders = function(userId, product, addressId) {
    var ret = {};

    var requiredFields = ['lineItems','status'];
    var fieldVals = {
        userId: userId,
        email: 'gforman@boxing.org',
        lineItems: [{prod_id: product._id, quantity: product.inventoryQty, price: product.price}],
        invoiceNumber: 'JG000001',
        shippingAddress: addressId,
        billingAddress: addressId,
        status: 'Ordered',
        dateCreated: Date.now()
    };

    requiredFields.forEach(function(missingField) {
        ret[missingField] = new Order({});
        requiredFields.forEach(function(field) {
            if(field !== missingField) {
                ret[missingField][field] = fieldVals[field];
            }
        });
    });

    return ret;
};

var generateNewUser = function() {
    return new User({
            email: 'jag47@cornell.edu',
            password: 'potus',
            firstName: 'John',
            lastName: 'Gruska',
            middleName: 'Anthony',
            role: 'Admin',
            active: true,
            pendingPasswordReset: false,
            dateCreated: Date.now()
        });
};

var generateNewAddress = function(userId) {
	return new Address({
            userId: userId,
            label: 'Work',
            name: 'John Gruska',
            address1: '20 Exchange Place',
            address2: 'Apt 4204',
            city: 'New York',
            state: 'NY',
            zip: '10005',
            active: true,
            origId: userId,
            dateCreated: Date.now()
        });
};

var generateNewCategory = function() {
    return new Category({
        name: 'Cars',
        description: 'Lots of cars!',
        active: true,
        dateCreated: Date.now()
    });
};

var generateNewProduct = function(categoryId) {
    return new Product({
        title: 'Porsche Turbo',
        categories: [categoryId],
        price: 100000,
        inventoryQty: 5,
        active: true,
        dateCreated: Date.now()
    });
};

describe('Order model', function () {
    var newOrderIn;
    var newOrderOut;
    var alternateOrderOut;
    var requireTestOrders;
    var sampleUser, sampleProduct, sampleCategory, sampleAddress;
    var badOrder = {error: 'bad'};   
    var badStatus = {error: 'bad'};
    var emptyLineItems = {error: 'bad'};
    
    beforeEach('Establish DB connection', function (done) {
        if (!mongoose.connection.db)
        	mongoose.connect(dbURI);

        sampleUser = generateNewUser();
        sampleCategory = generateNewCategory();
        
        var requiredKeys;
        var requiredPromises;
        badOrder = {error: 'bad'};   
        badStatus = {error: 'bad'};
        emptyLineItems = {error: 'bad'};
        

        Promise.all([sampleUser.save(), sampleCategory.save()])
        .then(function(userAndCategory) {
            sampleUser = userAndCategory[0];
            sampleCategory = userAndCategory[1];

            sampleProduct = generateNewProduct(sampleCategory._id);
            sampleAddress = generateNewAddress(sampleUser._id);

            return Promise.all([sampleProduct.save(), sampleAddress.save()]);
        })
        .then(function(productAndAddress) {
            sampleProduct = productAndAddress[0];
            sampleAddress = productAndAddress[1];

            requireTestOrders = generateIncompleteOrders(sampleUser._id, sampleProduct, sampleAddress._id);
            requiredKeys = Object.keys(requireTestOrders);
            requiredPromises = requiredKeys.map(function(field){return requireTestOrders[field].save()});
            return settle(requiredPromises);
        })
        .then(function(results) {
        	var i = 0;
            results.forEach(function(result) {
        		if(result.isRejected()) {
                    requireTestOrders[requiredKeys[i]].error = result.reason().errors[requiredKeys[i]].message;
        		}
        		i++;
        	})
        
            newOrderIn = generateNewOrder(sampleUser._id, sampleProduct, sampleAddress._id);
            return newOrderIn.save();
        })
        .then(function(savedOrder) {
        	newOrderOut = savedOrder;
            
            var orderMissingUserAndSession = generateNewOrder(sampleUser._id, sampleProduct, sampleAddress._id);
            orderMissingUserAndSession.userId = undefined;
            return orderMissingUserAndSession.save();
        })
        .then(function(savedOrder) {
            badOrder.error = undefined;   
        })
        .catch(function(err) {
            if(badOrder.error)
                console.log("*********** CAUGHT ERROR: ",err);
        })
        .then(function() {
            var orderWithBadStatus = generateNewOrder(sampleUser._id, sampleProduct, sampleAddress._id);
            orderWithBadStatus.status = 'FOOBAR';
            return orderWithBadStatus.save();
        })
        .then(function(savedOrder) {
            badStatus.error = undefined;   
        })
        .catch(function(error) {
            if(badStatus.error && badOrder.error)
                console.log("*********** CAUGHT ERROR: ",err);
        })
        .then(function() {
            alternateOrderOut = generateNewOrder(sampleUser._id, sampleProduct, sampleAddress._id);
            alternateOrderOut.userId = undefined;
            alternateOrderOut.sessionId = '123456';
            return alternateOrderOut.save();
        })
        .then(function(savedOrder) {
            alternateOrderOut = savedOrder;
        })
        .then(function() {
            var orderWithEmptyLineItems = generateNewOrder(sampleUser._id, sampleProduct, sampleAddress._id);
            orderWithEmptyLineItems.lineItems = [];
            return orderWithEmptyLineItems.save();
        })
        .then(function() {
            emptyLineItems.error = undefined;
            done();
        })
        .catch(function(err) {
            if(emptyLineItems.error)
                console.log("*********** CAUGHT ERROR: ",err);
            done();
        });
    });

    afterEach('Clear test database', function (done) {
    	mongoose.connection.collections['orders'].drop();
    	clearDB(done);
    });

    describe('Collection Existence', function() {
		it('should exist', function () {
	        expect(Order).to.be.a('function');
	    });
	});

    describe('Field Requirements', function() {
        describe('user or session', function() {
            xit('at least one needed', function() {
                expect(badOrder.error).to.exist;
            });
        });

        describe('userId', function () {
            it('should exist', function () {
                expect(newOrderOut.userId).to.exist;
            }); 
            it('should be a user id', function () {
                expect(newOrderOut.userId).to.equal(sampleUser._id);
            });             
        }); 

		describe('sessionId', function () {
			it('should exist', function () {
            	expect(alternateOrderOut.sessionId).to.exist;
        	});				
        	it('should be a string', function () {
                expect(alternateOrderOut.sessionId).to.equal('123456');
            }); 
		});	

		describe('email', function () {
			it('should exist', function () {
            	expect(newOrderOut.email).to.exist;
        	});				
        	it('should be a string', function () {
            	expect(newOrderOut.email).to.equal(newOrderIn.email);
        	});				
		});	

		describe('lineItems', function () {
            it('should exist', function () {
                expect(newOrderOut.lineItems).to.exist;
            });             
            it('should be an array', function () {
                expect(newOrderOut.lineItems).to.deep.equal(newOrderIn.lineItems);
            });
            xit('is required', function () {
                expect(requireTestOrders['lineItems'].error).to.equal('Path `lineItems` is required.');
            });
            xit('must be a non-empty array', function() {
                expect(emptyLineItems.error).to.equal('bad');
            });             
        }); 

        describe('invoiceNumber', function () {
            it('should exist', function () {
                expect(newOrderOut.invoiceNumber).to.exist;
            });             
            it('should be a string', function () {
                expect(newOrderOut.invoiceNumber).to.equal(newOrderIn.invoiceNumber);
            });            
        }); 

		describe('shippingAddress', function () {
            it('should exist', function () {
                expect(newOrderOut.shippingAddress).to.exist;
            });             
            it('should be an address ref', function () {
                expect(newOrderOut.shippingAddress).to.equal(sampleAddress._id);
            });             
        }); 

        describe('billingAddress', function () {
            it('should exist', function () {
                expect(newOrderOut.billingAddress).to.exist;
            });             
            it('should be an address ref', function () {
                expect(newOrderOut.billingAddress).to.equal(sampleAddress._id);
            });             
        }); 

		describe('status', function () {
			it('should exist', function () {
            	expect(newOrderOut.status).to.exist;
        	});				
        	it('should be a string', function () {
            	expect(newOrderOut.status).to.equal(newOrderIn.status);
        	});
        	it('is required', function () {
                expect(requireTestOrders['status'].error).to.equal('Path `status` is required.');
            });             
            it('must be a valid status enum', function () {
                expect(badStatus.error).to.exist;
            });             
		});	
        
		describe('dateCreated', function () {
			it('should exist', function () {
            	expect(newOrderOut.dateCreated).to.exist;
        	});				
        	it('should be a date', function () {
            	expect(newOrderOut.dateCreated).to.equal(newOrderIn.dateCreated);
        	});				
		});	

		describe('dateModified', function () {
            it('should not exist', function () {
                expect(newOrderOut.dateModified).to.not.exist;
            });             
        });
    });

    describe('Virtuals', function() {
        describe('subtotal', function() {
            it('should exists', function() {
                expect(newOrderOut.subtotal).to.exist;
            });
            it('should total up lineItems', function() {
                expect(newOrderOut.subtotal).to.equal(100000 * 5);
            });
        });

        describe('total', function () {
            it('should exist', function () {
                expect(newOrderOut.total).to.exist;
            }); 
        }); 
    });
});
