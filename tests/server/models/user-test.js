var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var settle = require('promise-settle');

// Require in all models.
require('../../../server/db/models');

var User = mongoose.model('User');

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
        	xit('should be unique', function () {
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
		});	

		describe('pendingPasswordReset', function () {
			it('should exist', function () {
            	expect(newUserOut.pendingPasswordReset).to.exist;
        	});				
        	it('should be a boolean', function () {
            	expect(newUserOut.pendingPasswordReset).to.equal(newUserIn.pendingPasswordReset);
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

    describe('Password Encryption', function () {

        describe('generateSalt method', function () {

            it('should exist', function () {
                expect(User.generateSalt).to.be.a('function');
            });

            it('should return a random string basically', function () {
                expect(User.generateSalt()).to.be.a('string');
            });

        });

        describe('encryptPassword', function () {

            var cryptoStub;
            var hashUpdateSpy;
            var hashDigestStub;
            beforeEach(function () {

                cryptoStub = sinon.stub(require('crypto'), 'createHash');

                hashUpdateSpy = sinon.spy();
                hashDigestStub = sinon.stub();

                cryptoStub.returns({
                    update: hashUpdateSpy,
                    digest: hashDigestStub
                });

            });

            afterEach(function () {
                cryptoStub.restore();
            });

            it('should exist', function () {
                expect(User.encryptPassword).to.be.a('function');
            });

            it('should call crypto.createHash with "sha1"', function () {
                User.encryptPassword('asldkjf', 'asd08uf2j');
                expect(cryptoStub.calledWith('sha1')).to.be.ok;
            });

            it('should call hash.update with the first and second argument', function () {

                var pass = 'testing';
                var salt = '1093jf10j23ej===12j';

                User.encryptPassword(pass, salt);

                expect(hashUpdateSpy.getCall(0).args[0]).to.be.equal(pass);
                expect(hashUpdateSpy.getCall(1).args[0]).to.be.equal(salt);

            });

            it('should call hash.digest with hex and return the result', function () {

                var x = {};
                hashDigestStub.returns(x);

                var e = User.encryptPassword('sdlkfj', 'asldkjflksf');

                expect(hashDigestStub.calledWith('hex')).to.be.ok;
                expect(e).to.be.equal(x);

            });

        });

        describe('on creation', function () {

            var encryptSpy;
            var saltSpy;

            var createUser = function () {
                return generatePotus().save();//User.create({ email: 'obama@gmail.com', password: 'potus' });
            };

            beforeEach(function () {
                encryptSpy = sinon.spy(User, 'encryptPassword');
                saltSpy = sinon.spy(User, 'generateSalt');
            });

            afterEach(function () {
                encryptSpy.restore();
                saltSpy.restore();
            });

            it('should call User.encryptPassword with the given password and generated salt', function (done) {
                createUser().then(function () {
                    var generatedSalt = saltSpy.getCall(0).returnValue;
                    expect(encryptSpy.calledWith('potus', generatedSalt)).to.be.ok;
                    done();
                });
            });

            it('should set user.salt to the generated salt', function (done) {
               createUser().then(function (user) {
                   var generatedSalt = saltSpy.getCall(0).returnValue;
                   expect(user.salt).to.be.equal(generatedSalt);
                   done();
               });
            });

            it('should set user.password to the encrypted password', function (done) {
                createUser().then(function (user) {
                    var createdPassword = encryptSpy.getCall(0).returnValue;
                    expect(user.password).to.be.equal(createdPassword);
                    done();
                });
            });

        });

        describe('sanitize method', function () {

            var createUser = function () {
                return generatePotus().save();//User.create({ email: 'obama@gmail.com', password: 'potus' });
            };

            it('should remove sensitive information from a user object', function () {
                createUser().then(function (user) {
                    var sanitizedUser = user.sanitize();
                    expect(user.password).to.be.ok;
                    expect(user.salt).to.be.ok;
                    expect(sanitizedUser.password).to.be.undefined;
                    expect(sanitizedUser.salt).to.be.undefined;
                });
            });
        });

    });

});
