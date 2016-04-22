var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var settle = require('promise-settle');

// Require in all models.
require('../../../server/db/models');

var Address = mongoose.model('Address');

var generateIncompleteUsers = function() {
	var ret = {};

	var requiredFields = ['email','password','firstName','lastName','role','active','pendingPasswordReset'];
	var fieldVals = {
		password: '123',
		firstName: 'George',
		lastName: 'Forman',
		role: 'User',
		active: true,
		pendingPasswordReset: false
	};

	requiredFields.forEach(function(missingField) {
		ret[missingField] = new User({});
		requiredFields.forEach(function(field) {
			if(field !== missingField) {
				if(field === 'email')
					ret[missingField][field] = Math.random().toString(36).slice(2,10)+"@gmail.com";	
				else
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
}

describe('User model', function () {

    var newUserIn = generateNewUser();
    var newUserOut;
    var dupeError;
    var requireTestUsers = generateIncompleteUsers();
    
    beforeEach('Establish DB connection', function (done) {
        if (!mongoose.connection.db)// return done();
        	mongoose.connect(dbURI);

        var requiredKeys = Object.keys(requireTestUsers);
        var requiredPromises = requiredKeys.map(function(field){return requireTestUsers[field].save()});
        
        settle(requiredPromises)
        .then(function(results) {
        	var i = 0;
        	results.forEach(function(result) {
        		if(result.isRejected()) {
        			requireTestUsers[requiredKeys[i]].error = result.reason().errors[requiredKeys[i]].message;
        		}
        		i++;
        	})
        	return newUserIn.save();
        })
        .then(function(savedUser) {
        	newUserOut = savedUser;
        	return generateNewUser().save();		// attempting to create a dupe
        })
        .then(function(savedUser2) {
        	done();
        })
        .catch(function(error) {
        	dupeError = error.message;
        	console.log(dupeError);
        	done();
        });
    });

    afterEach('Clear test database', function (done) {
    	mongoose.connection.collections['users'].drop();
    	clearDB(done);
    });

    describe('Collection Existence', function() {
		it('should exist', function () {
	        expect(User).to.be.a('function');
	    });
	});

    describe('Field Requirements', function() {
		describe('email', function () {
			it('should exist', function () {
            	expect(newUserOut.email).to.exist;
        	});				
        	it('should be a string', function () {
            	expect(newUserOut.email).to.equal(newUserIn.email);
        	});				
        	it('is required', function () {
            	expect(requireTestUsers['email'].error).to.equal('Path `email` is required.');
        	});				
        	it('should be unique', function () {
            	expect(dupeError).to.contain('dup');
            	expect(dupeError).to.contain('email');
        	});				
		});	

		describe('firstName', function () {
			it('should exist', function () {
            	expect(newUserOut.firstName).to.exist;
        	});				
        	it('should be a string', function () {
            	expect(newUserOut.firstName).to.equal(newUserIn.firstName);
        	});
        	it('is required', function () {
            	expect(requireTestUsers['firstName'].error).to.equal('Path `firstName` is required.');
        	});				
        					
		});	

		describe('lastName', function () {
			it('should exist', function () {
            	expect(newUserOut.lastName).to.exist;
        	});				
        	it('should be a string', function () {
            	expect(newUserOut.lastName).to.equal(newUserIn.lastName);
        	});				
        	it('is required', function () {
            	expect(requireTestUsers['lastName'].error).to.equal('Path `lastName` is required.');
        	});				
        	
		});	

		describe('middleName', function () {
			it('should exist', function () {
            	expect(newUserOut.middleName).to.exist;
        	});				
        	it('should be a string', function () {
            	expect(newUserOut.middleName).to.equal(newUserIn.middleName);
        	});
		});	

		describe('role', function () {
			it('should exist', function () {
            	expect(newUserOut.role).to.exist;
        	});				
        	it('should be a string', function () {
            	expect(newUserOut.role).to.equal(newUserIn.role);
        	});				
        	it('is required', function () {
            	expect(requireTestUsers['role'].error).to.equal('Path `role` is required.');
        	});				
        	
		});	

		describe('active', function () {
			it('should exist', function () {
            	expect(newUserOut.active).to.exist;
        	});				
        	it('should be a boolean', function () {
            	expect(newUserOut.active).to.equal(newUserIn.active);
        	});
        	it('is required', function () {
            	expect(requireTestUsers['active'].error).to.equal('Path `active` is required.');
        	});				
        					
		});	

		describe('pendingPasswordReset', function () {
			it('should exist', function () {
            	expect(newUserOut.pendingPasswordReset).to.exist;
        	});				
        	it('should be a boolean', function () {
            	expect(newUserOut.pendingPasswordReset).to.equal(newUserIn.pendingPasswordReset);
        	});				
        	it('is required', function () {
            	expect(requireTestUsers['pendingPasswordReset'].error).to.equal('Path `pendingPasswordReset` is required.');
        	});				
		});	

		describe('dateCreated', function () {
			it('should exist', function () {
            	expect(newUserOut.dateCreated).to.exist;
        	});				
        	it('should be a date', function () {
            	expect(newUserOut.dateCreated).to.equal(newUserIn.dateCreated);
        	});				
		});	

		describe('dateModified', function () {
			it('should not exist', function () {
            	expect(newUserOut.dateModified).to.not.exist;
        	});				
		});
    });
});
