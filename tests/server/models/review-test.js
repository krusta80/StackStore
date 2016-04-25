var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var expect = require('chai').expect;
var mongoose = require('mongoose');
var Review = require('../../../server/db/models/review');
var Product = require('../../../server/db/models/product');
var Category = require('../../../server/db/models/category');
var User = require('../../../server/db/models/user');

var generateNewUser = function(){
	return new User({
		email: 'chris@gmail.com',
		password: 'chrisrules',
		firstName: 'Chris',
		lastName: 'Topholus',
		role: 'User',
		active: true,
		pendingPasswordReset: false
	})
}

var generateNewCategory = function(){
	return new Category({
		name: 'Cheap'
	});
}

var generateNewProduct = function(){
	return new Product({
		title: 'Cool Thing',
		categories: [generateNewCategory()],
		price: 2,
		inventoryQty: 50,
		active: true
	});
}

var generateNewReview = function(){
	return new Review({
		product: generateNewProduct()._id,
		user: generateNewUser()._id,
		title: 'Funky Title',
		stars: 5,
		description: 'I liked this product'
	});
}

describe('Review', function(){
	beforeEach('Establish DB connection', function (done) {
        if (!mongoose.connection.db)// return done();
            mongoose.connect(dbURI);
        done();
    });

	it('has product, user, title, stars, and description', function(done){
		var review = generateNewReview();

		review.save()
		.then(function(savedReview){
			expect(savedReview.product).to.equal(review.product);
			expect(savedReview.user).to.equal(review.user);
			expect(savedReview.title).to.equal('Funky Title');
			expect(savedReview.stars).to.equal(5);
			expect(savedReview.description).to.equal('I liked this product');
			done();
		})
		.catch(function(err){
			done(err);
		})
	});

	it('requires product', function(done){
		var review = new Review({
			//product: '123',
			user: generateNewUser()._id,
			title: 'Funky Title',
			stars: 5,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		})
	});

	it('requires user', function(done){
		var review = new Review({
			product: generateNewProduct()._id,
			// user: '456',
			title: 'Funky Title',
			stars: 5,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		})
	});

	it('requires title', function(done){
		var review = new Review({
			product: generateNewProduct()._id,
			user: generateNewUser()._id,
			// title: 'Funky Title',
			stars: 5,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		})
	});

	it('stars', function(done){
		var review = new Review({
			product: generateNewProduct()._id,
			user: generateNewUser()._id,
			title: 'Funky Title',
			// stars: 5,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		})
	});

	it('requires description', function(done){
		var review = new Review({
			product: generateNewProduct()._id,
			user: generateNewUser()._id,
			title: 'Funky Title',
			stars: 5
			// description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		})
	});

	it('requires a star value of at least 1', function(done){
		var review = new Review({
			product: generateNewProduct()._id,
			user: generateNewUser()._id,
			title: 'Funky Title',
			stars: 0,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		})
	});

	it('requires a star value of at most 5', function(done){
		var review = new Review({
			product: generateNewProduct()._id,
			user: generateNewUser()._id,
			title: 'Funky Title',
			stars: 6,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		})
	});
});



