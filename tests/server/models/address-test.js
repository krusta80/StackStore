var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var settle = require('promise-settle');

// Require in all models.
require('../../../server/db/models');

var User = mongoose.model('Address');

var generateIncompleteAddresses = function() {
	var ret = {};

	var requiredFields = ['userId','name','address1','city','state','zip'];
	var fieldVals = {
		userId: '123',
        name: 'George Forman',
        address1: '20 Exchange Place',
        address2: 'Apt 4204',
        city: 'New York',
        state: 'NY',
        zip: '10005',
        active: true,
        origId: '123'
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

var generateNewAddress = function() {
	return new Address({
            userId: '321',
            name: 'John Gruska',
            address1: '20 Exchange Place',
            address2: 'Apt 4204',
            city: 'New York',
            state: 'NY',
            zip: '10005',
            active: true,
            origId: '321',
            dateCreated: Date.now()
        });
}

describe('Address model', function () {

    var newAddressIn = generateNewAddress();
    var newAddressOut;
    var dupeError;
    var requireTestAddresses = generateIncompleteAddresses();
    
    beforeEach('Establish DB connection', function (done) {
        if (!mongoose.connection.db)// return done();
        	mongoose.connect(dbURI);

        var requiredKeys = Object.keys(requireTestAddresses);
        var requiredPromises = requiredKeys.map(function(field){return requireTestAddresses[field].save()});
        
        settle(requiredPromises)
        .then(function(results) {
        	var i = 0;
        	results.forEach(function(result) {
        		if(result.isRejected()) {
        			requireTestAddresses[requiredKeys[i]].error = result.reason().errors[requiredKeys[i]].message;
        		}
        		i++;
        	})
        	return newAddressIn.save();
        })
        .then(function(savedAddress) {
        	newAddressOut = savedAddress;
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
        	it('is required', function () {
            	expect(requireTestAddresses['userId'].error).to.equal('Path `userId` is required.');
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
                return User.create({ email: 'obama@gmail.com', password: 'potus' });
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
                return User.create({ email: 'obama@gmail.com', password: 'potus' });
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
