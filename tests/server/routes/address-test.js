// Instantiate all models
var mongoose = require('mongoose');
require('../../../server/db/models');
var User = mongoose.model('User');
var Address = mongoose.model('Address');

var expect = require('chai').expect;

var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var supertest = require('supertest');
var app = require('../../../server/app');

var cloneAddressFields = function(address) {
	return {
		userId: address.userId,
        label: address.label,
        name: address.name,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        state: address.state,
        zip: address.zip,
        active: address.active,
        dateCreated: address.dateCreated
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

var seedAddresses = function (userId) {

    var addresses = [
        {
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
        },
        {
            userId: userId,
            label: 'Home',
            name: 'John Gruska',
            address1: '135 Windsor Place',
            city: 'Massapequa',
            state: 'NY',
            zip: '11758',
            active: true,
            origId: userId,
            dateCreated: Date.now()
        },
        {
            userId: userId,
            label: 'OLD',
            name: 'John Gruska',
            address1: '135 Windsor Place',
            city: 'Massapequa',
            state: 'NY',
            zip: '11758',
            active: true,
            origId: userId,
            dateCreated: Date.now(),
            dateModified: Date.now()
        }
    ];

    return Address.create(addresses);
};

var loggedInAgent;
var testUser;
var testAddresses;

describe('Addresses Route', function () {

	beforeEach('Establish DB connection', function (done) {
		if (!mongoose.connection.db) 
			mongoose.connect(dbURI);

		//	seed the db
		seedUsers()
		.then(function(users) {
			testUser = users[0];
			return seedAddresses(testUser._id);
		})
		.then(function() {
			return Address.find({dateModified : {$exists : false }})
		})
		.then(function(addresses) {
			testAddresses = addresses;
			
			// log in 
			loggedInAgent = supertest.agent(app);
			loggedInAgent.post('/login').send({email: 'jag47@cornell.edu', password: 'potus'}).end(done);
		});
	});

	afterEach('Clear test database', function (done) {
		clearDB(done);
	});

	describe('/get', function () {
		xdescribe('- all', function () {
			
			var response;

			beforeEach('Execute get request', function (done) {
				loggedInAgent.get('/api/addresses')
				.end(function(err, res) {
					response = res;
					done();
				});
			});
	
			it('should get with 200 response', function (done) {
				expect(response.statusCode).to.equal(200);
				done();
			});

			it('should respond with an array of length 2', function (done) {
				expect(response.body.length).to.equal(2);
				done();
			});

			it('it should exclude addresses with dateModified', function (done) {
				var filteredForDM = response.body.filter(function(address) {
					return !address.dateModified;
				});
				expect(filteredForDM.length).to.equal(response.body.length);
				done();
			});
		});

		describe('- by ID', function () {
			var response;
			var testAddress;

			beforeEach('Execute get request', function (done) {
				testAddress = testAddresses[0];
				loggedInAgent.get('/api/addresses/'+testAddress._id)
				.end(function(err, res) {
					response = res;
					done();
				});
			});
	
			it('should get with 200 response', function (done) {
				expect(response.statusCode).to.equal(200);
				done();
			});

			it('should respond with the correct address', function (done) {
				var isGood = Object.keys(response.body).reduce(function(bool, field) {
					if(field === 'dateCreated')
						return true;
					return bool && (response.body[field] == testAddress[field])
				}, true);
				expect(isGood).to.equal(true);
				done();
			});
		});
	});

	describe('/post', function () {	
		var response;
		var newAddress;

		beforeEach('Execute post request', function (done) {
			newAddress = {
	            userId: testUser._id,
	            label: 'NEW',
	            name: 'John Gruska',
	            address1: '111 Lois Lane',
	            city: 'Metropolis',
	            state: 'NY',
	            zip: '11758',
	            active: true,
	            dateCreated: Date.now()
	        };
		
			loggedInAgent.post('/api/addresses', newAddress)
			.end(function(err, res) {
				response = res;
				done();
			});
		});

		it('should post with 200 response', function (done) {
			expect(response.statusCode).to.equal(200);
			done();
		});

		it('should create and respond with the new address', function (done) {
			var isGood = Object.keys(newAddress).reduce(function(bool, field) {
				if(field === 'dateCreated')
					return true;
				return bool && (response.body[field] == newAddress[field]);
			}, true);
			expect(isGood && response.body._id).to.equal(true);
			done();
		});

		it('should have its origId equal its _id', function (done) {
			expect(response.body._id).to.equal(response.body.origId);
			done();
		});
	});

	describe('/put', function () {	
		var response;
		var origAddressDocPrePut, origAddressDocPostPut, modifiedAddress;
		var addressFields;
		
		beforeEach('Execute put request', function (done) {
			origAddressDocPrePut = testAddresses[1];
			modifiedAddress = cloneAddressFields(origAddressDocPrePut);
			modifiedAddress.label = 'Maximus';

			addressFields = Object.keys(modifiedAddress);
			
			loggedInAgent.put('/api/addresses/'+origAddressDocPrePut._id, modifiedAddress)
			.end(function(err, res) {
				response = res;
				Address.findById(origAddressDocPrePut._id)
				.then(function(origAddress) {
					origAddressDocPostPut = origAddress;
				});
				done();
			});
		});

		it('should put with 200 response', function (done) {
			expect(response.statusCode).to.equal(200);
			done();
		});

		it('should create a new address and respond with it', function (done) {
			expect(response.body._id).to.not.equal(origAddressDocPrePut._id);
			done();
		});

		it('should respond with the modified details', function (done) {
			var isGood = addressFields.reduce(function(bool, field) {
				if(field === 'dateCreated')
					return true;
				return bool && (response.body[field] == modifiedAddress[field]);
			}, true);
			expect(isGood && !response.body.dateModified).to.equal(true);
			done();
		});

		it('should ONLY add a modified date to the original document', function (done) {
			var isGood = addressFields.reduce(function(bool, field) {
				if(field === 'dateCreated')
					return true;
				return bool && (origAddressDocPrePut[field] == origAddressDocPostPut[field]);
			}, true);
			expect(isGood && origAddressDocPostPut.dateModified).to.equal(true);
			done();
		});

		it('should have its origId equal the original origId', function (done) {
			expect(response.body.origId).to.equal(origAddressDocPrePut.origId);
			done();
		});
	});

	describe('/delete', function () {	
		var response;
		var origAddressDoc;
		var addressFields;
		
		beforeEach('Execute delete request', function (done) {
			origAddressDoc = testAddresses[1];
			var deletedAddress = cloneAddressFields(origAddressDoc);
			addressFields = Object.keys(deletedAddress);
			
			loggedInAgent.delete('/api/addresses/'+origAddressDoc._id)
			.end(function(err, res) {
				response = res;
				done();
			});
		});

		it('should put with 200 response', function (done) {
			expect(response.statusCode).to.equal(200);
			done();
		});

		it('should respond with the original doc id', function (done) {
			expect(response.body._id).to.equal(origAddressDoc._id);
			done();
		});

		it('should ONLY add a modified date to the original document', function (done) {
			var isGood = addressFields.reduce(function(bool, field) {
				if(field === 'dateCreated')
					return true;
				return bool && (origAddressDoc[field] == response.body[field]);
			}, true);
			expect(isGood && response.body.dateModified).to.equal(true);
			done();
		});
	});
});
