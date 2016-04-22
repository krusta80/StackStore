var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var settle = require('promise-settle');

// Require in all models.
require('../../../server/db/models');

var Address = mongoose.model('Address');
var User = mongoose.model('User');

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
}

var generatePotus = function() {
    return new User({
            email: 'obama@gmail.com',
            password: 'potus',
            firstName: 'John',
            lastName: 'Gruska',
            middleName: 'Anthony',
            role: 'Admin',
            active: true,
            pendingPasswordReset: false,
            dateCreated: Date.now()
        });
}

var generateIncompleteAddresses = function(userId) {
	var ret = {};

	var requiredFields = ['userId','name','address1','city','state','zip'];
	var fieldVals = {
		userId: userId,
        label: 'Home',
        name: 'George Forman',
        address1: '20 Exchange Place',
        address2: 'Apt 4204',
        city: 'New York',
        state: 'NY',
        zip: '10005',
        active: true,
        origId: userId
	};

	requiredFields.forEach(function(missingField) {
		ret[missingField] = new Address({});
		requiredFields.forEach(function(field) {
			if(field !== missingField) {
				ret[missingField][field] = fieldVals[field];
			}
		});
	});

    return ret;
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
}

describe('Address model', function () {

    var newAddressIn;
    var newAddressOut;
    var dupeError;
    var requireTestAddresses;
    var sampleUser1;
    var sampleUser2;
    var badState = {error: 'bad'};
    
    beforeEach('Establish DB connection', function (done) {
        if (!mongoose.connection.db)// return done();
        	mongoose.connect(dbURI);

        sampleUser1 = generateNewUser();
        sampleUser2 = generatePotus();
        var requiredKeys;
        var requiredPromises;
            
        sampleUser1.save()
        .then(function(user) {
            sampleUser1 = user;
            requireTestAddresses = generateIncompleteAddresses(user._id);
            requiredKeys = Object.keys(requireTestAddresses);
            requiredPromises = requiredKeys.map(function(field){return requireTestAddresses[field].save()});
            return settle(requiredPromises);
        })
        .then(function(results) {
        	var i = 0;
            results.forEach(function(result) {
        		if(result.isRejected()) {
        			requireTestAddresses[requiredKeys[i]].error = result.reason().errors[requiredKeys[i]].message;
        		}
        		i++;
        	})
        
            return sampleUser2.save();
        })
        .then(function(user2) {
            sampleUser2 = user2;
            newAddressIn = generateNewAddress(user2._id);
            return newAddressIn.save();
        })
        .then(function(savedAddress) {
        	newAddressOut = savedAddress;
            
            var badStateAddress = generateNewAddress(sampleUser2._id);
            badStateAddress.state = 'XX';
            return badStateAddress.save();
        })
        .then(function(badStateAddress) {
            badState.error = undefined;   
        })
        .catch(function(err) {
            if(!err.errors.state)
                console.log("*********** CAUGHT ERROR: ",err);
            done();
        });
    });

    afterEach('Clear test database', function (done) {
    	mongoose.connection.collections['addresses'].drop();
    	clearDB(done);
    });

    describe('Collection Existence', function() {
		it('should exist', function () {
	        expect(Address).to.be.a('function');
	    });
	});

    describe('Field Requirements', function() {
		describe('userId', function () {
			it('should exist', function () {
            	expect(newAddressOut.userId).to.exist;
        	});	
            it('should be a user id', function () {
                expect(newAddressOut.userId).to.equal(sampleUser2._id);
            });             
		});	

		describe('label', function () {
			it('should exist', function () {
            	expect(newAddressOut.label).to.exist;
        	});				
        	it('should be a string', function () {
                expect(newAddressOut.label).to.equal(newAddressIn.label);
            }); 
		});	

		describe('name', function () {
			it('should exist', function () {
            	expect(newAddressOut.name).to.exist;
        	});				
        	it('should be a string', function () {
            	expect(newAddressOut.name).to.equal(newAddressIn.name);
        	});				
        	it('is required', function () {
                expect(requireTestAddresses['name'].error).to.equal('Path `name` is required.');
            });             
		});	

		describe('address1', function () {
            it('should exist', function () {
                expect(newAddressOut.address1).to.exist;
            });             
            it('should be a string', function () {
                expect(newAddressOut.address1).to.equal(newAddressIn.address1);
            });
            it('is required', function () {
                expect(requireTestAddresses['address1'].error).to.equal('Path `address1` is required.');
            });             
        }); 

        describe('address2', function () {
            it('should exist', function () {
                expect(newAddressOut.address2).to.exist;
            });             
            it('should be a string', function () {
                expect(newAddressOut.address2).to.equal(newAddressIn.address2);
            });            
        }); 

		describe('city', function () {
			it('should exist', function () {
            	expect(newAddressOut.city).to.exist;
        	});				
        	it('should be a string', function () {
            	expect(newAddressOut.city).to.equal(newAddressIn.city);
        	});				
        	it('is required', function () {
            	expect(requireTestAddresses['city'].error).to.equal('Path `city` is required.');
        	});				
		});	

		describe('state', function () {
			it('should exist', function () {
            	expect(newAddressOut.state).to.exist;
        	});				
        	it('should be a string', function () {
            	expect(newAddressOut.state).to.equal(newAddressIn.state);
        	});
        	it('is required', function () {
                expect(requireTestAddresses['state'].error).to.equal('Path `state` is required.');
            });             
            it('is must be a valid state abbr', function () {
                expect(badState.error).to.exist;
            });             
		});	

		describe('zip', function () {
			it('should exist', function () {
            	expect(newAddressOut.zip).to.exist;
        	});				
        	it('should be a string', function () {
            	expect(newAddressOut.zip).to.equal(newAddressIn.zip);
        	});				
        	it('is required', function () {
            	expect(requireTestAddresses['zip'].error).to.equal('Path `zip` is required.');
        	});				
		});	

        describe('active', function () {
            it('should exist', function () {
                expect(newAddressOut.active).to.exist;
            });             
            it('should be a boolean', function () {
                expect(newAddressOut.active).to.equal(newAddressIn.active);
            });
        }); 

        describe('dateCreated', function () {
			it('should exist', function () {
            	expect(newAddressOut.dateCreated).to.exist;
        	});				
        	it('should be a date', function () {
            	expect(newAddressOut.dateCreated).to.equal(newAddressIn.dateCreated);
        	});				
		});	

		describe('dateModified', function () {
			it('should not exist', function () {
            	expect(newAddressOut.dateModified).to.not.exist;
        	});				
		});
    });
});
