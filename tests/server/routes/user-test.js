// Instantiate all models
var mongoose = require('mongoose');
require('../../../server/db/models');
var User = mongoose.model('User');

var expect = require('chai').expect;

var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var supertest = require('supertest');
var app = require('../../../server/app');

var cloneUserFields = function(user) {
	return {
		email: user.email,
		password: user.password,
		firstName: user.firstName,
		middleName: user.middleName,
		lastName: user.lastName,
		role: user.role,
		active: user.active,
		pendingPasswordReset: user.pendingPasswordReset,
		dateCreated: user.dateCreated
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
        },
        {
            email: 'krusta80@aol.com',
            password: 'yougotmail',
            firstName: 'Jay',
            lastName: 'Ginsta',
            role: 'User',
            active: true,
            pendingPasswordReset: false,
            dateCreated: Date.now()
        },
        {
            email: 'david@yahoo.com',
            password: 'ohhhbaby',
            firstName: 'David',
            lastName: 'Yang',
            role: 'User',
            active: true,
            pendingPasswordReset: false,
            dateCreated: Date.now(),
            dateModified:  Date.now()
        }
    ];

    return User.create(users);
};

var loggedInAgent;
var testUsers;

describe('Users Route', function () {

	beforeEach('Establish DB connection', function (done) {
		if (!mongoose.connection.db) 
			mongoose.connect(dbURI);

		//	seed the db
		seedUsers()
		.then(function() {
			return User.find({dateModified : {$exists : false }})
		})
		.then(function(users) {
			testUsers = users;
			
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
				loggedInAgent.get('/api/users')
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

			it('it should exclude users with dateModified', function (done) {
				var filteredForDM = response.body.filter(function(user) {
					return !user.dateModified;
				});
				expect(filteredForDM.length).to.equal(response.body.length);
				done();
			});
		});

		describe('- by ID', function () {
			var response;
			var testUser;

			beforeEach('Execute get request', function (done) {
				testUser = testUsers[0];
				loggedInAgent.get('/api/users/'+testUser._id)
				.end(function(err, res) {
					response = res;
					done();
				});
			});
	
			it('should get with 200 response', function (done) {
				expect(response.statusCode).to.equal(200);
				done();
			});

			it('should respond with the correct user', function (done) {
				var isGood = Object.keys(response.body).reduce(function(bool, field) {
					if(field === 'dateCreated')
						return true;
					return bool && (response.body[field] == testUser[field])
				}, true);
				expect(isGood).to.equal(true);
				done();
			});
		});
	});

	describe('/post', function () {	
		var response;
		var newUser = {
            email: 'noob@hotmail.com',
            password: 'n00b4evah',
            firstName: 'Green',
            lastName: 'Behindears',
            role: 'User',
            active: true,
            pendingPasswordReset: false,
            dateCreated: Date.now()
        };

        var newUser2 = {
            email: 'noob@hotmail.com',
            password: 'n00b4evah',
            firstName: 'Green',
            lastName: 'Behindears',
            role: 'User',
            active: true,
            pendingPasswordReset: false,
            dateCreated: Date.now()
        };

		beforeEach('Execute post request', function (done) {
			loggedInAgent.post('/api/users', newUser)
			.end(function(err, res) {
				response = res;
				done();
			});
		});

		it('should post with 200 response', function (done) {
			expect(response.statusCode).to.equal(200);
			done();
		});

		it('should create and respond with the new user', function (done) {
			var isGood = Object.keys(newUser).reduce(function(bool, field) {
				if(field === 'dateCreated')
					return true;
				return bool && (response.body[field] == newUser[field]);
			}, true);
			expect(isGood && response.body._id).to.equal(true);
			done();
		});

		it('should have its origId equal its _id', function (done) {
			expect(response.body._id).to.equal(response.body.origId);
			done();
		});

		it('should not allow a duplicate email on live records', function(done) {
			loggedInAgent.post('/api/users', newUser2)
			.end(function(err,res) {
				expect(res.statusCode).to.not.equal(200);
				done();
			});
		});
	});

	describe('/put', function () {	
		var response;
		var origUserDocPrePut, origUserDocPostPut, modifiedUser;
		var userFields;
		
		beforeEach('Execute put request', function (done) {
			origUserDocPrePut = testUsers[1];
			modifiedUser = cloneUserFields(origUserDocPrePut);
			modifiedUser.middleName = 'Maximus';

			userFields = Object.keys(modifiedUser);
			
			loggedInAgent.put('/api/users/'+origUserDocPrePut._id, modifiedUser)
			.end(function(err, res) {
				response = res;
				User.findById(origUserDocPrePut._id)
				.then(function(origUser) {
					origUserDocPostPut = origUser;
				});
				done();
			});
		});

		it('should put with 200 response', function (done) {
			expect(response.statusCode).to.equal(200);
			done();
		});

		it('should create a new user and respond with it', function (done) {
			expect(response.body._id).to.not.equal(origUserDocPrePut._id);
			done();
		});

		it('should respond with the modified details', function (done) {
			var isGood = userFields.reduce(function(bool, field) {
				if(field === 'dateCreated')
					return true;
				return bool && (response.body[field] == modifiedUser[field]);
			}, true);
			expect(isGood && !response.body.dateModified).to.equal(true);
			done();
		});

		it('should ONLY add a modified date to the original document', function (done) {
			var isGood = userFields.reduce(function(bool, field) {
				if(field === 'dateCreated')
					return true;
				return bool && (origUserDocPrePut[field] == origUserDocPostPut[field]);
			}, true);
			expect(isGood && origUserDocPostPut.dateModified).to.equal(true);
			done();
		});

		it('should have its origId equal the original origId', function (done) {
			expect(response.body.origId).to.equal(origUserDocPrePut.origId);
			done();
		});
	});

	describe('/delete', function () {	
		var response;
		var origUserDoc;
		var userFields;
		
		beforeEach('Execute delete request', function (done) {
			origUserDoc = testUsers[1];
			var deletedUser = cloneUserFields(origUserDoc);
			userFields = Object.keys(deletedUser);
			
			loggedInAgent.delete('/api/users/'+origUserDoc._id)
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
			expect(response.body._id).to.equal(origUserDoc._id);
			done();
		});

		it('should ONLY add a modified date to the original document', function (done) {
			var isGood = userFields.reduce(function(bool, field) {
				if(field === 'dateCreated')
					return true;
				return bool && (origUserDoc[field] == response.body[field]);
			}, true);
			expect(isGood && response.body.dateModified).to.equal(true);
			done();
		});
	});
});
