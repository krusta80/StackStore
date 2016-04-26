var mongoose = require('mongoose');
require('../../../server/db/models');
var Review = mongoose.model('Review');
var Product = mongoose.model('Product');
var Category = mongoose.model('Category');
var User = mongoose.model('User');

var expect = require('chai').expect;

var dbURI = 'mongodb://localhost:27017/testingDB';

var request = require('supertest');
var app = require('../../../server/app');
var agent = request.agent(app);

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
		title: 'My Review',
		stars: 3,
		description: 'I liked it'
	});
}

describe('Review Route', function(){
	beforeEach('Establish DB Connection', function(done){
		if (mongoose.connection.db) return done();
		mongoose.connect(dbURI, done);
	});

	describe('GET All Reviews', function(){
		it('responds with an array via JSON', function(done){
			agent
				.get('/api/reviews')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res){
					expect(res.body).to.be.an.instanceOf(Array);
				})
				.end(done)
		});

		it('returns a review if there is one in the DB', function(done){
			var review = generateNewReview();

			review.save().then(function(){
				agent
					.get('/api/reviews/')
					.expect(200)
					.expect(function(res){
						expect(res.body).to.be.an.instanceOf(Array);
						expect(res.body[0].title).to.equal('My Review');
					})
					.end(done);
			}).then(null, done);
		});

	});

	describe('GET One Review', function(){
		var review;

		before(function(done){
			review = generateNewReview();
			review.save().then(function(){
				done();
			}, done);
		});

		it('retrieves one review and responds with an array via JSON', function(done){
			agent
				.get('/api/reviews/' + review._id)
				.expect(200)
				.expect(function(res){
					expect(res.body.title).to.equal('My Review')
				})
				.end(done);
		});

		it('fails and returns a 404 error when you pass a bad ID', function(done){
			agent
				.get('/api/reviews/9282')
				.expect(404)
				.end(done);
		});

		it('saves the review to the DB', function(done){
			Review.findOne({
				title: 'My Review'
			}).exec().then(function(review){
				expect(review).to.exist;
				expect(review.description).to.equal('I liked it');
				done();
			}).then(null, done);
		});
	});

	describe('PUT Reviews', function(){
		var review;
		before(function(done){
			Review.findOne({
				title: 'My Review'
			}).exec().then(function(_review){
				review = _review;
				done();
			}).then(null, done);
		});

		it('updates the description', function(done){
			agent
				.put('/api/reviews/'+review._id)
				.send({
					description: 'I REALLY liked it'
				})
				.expect(200)
				.expect(function(res){
					expect(res.body.description)
				})
				.end(done)
		});
	});

	describe('DELETE Reviews', function(){
		var review;
		before(function(done){
			Review.findOne({
				title: 'My Review'
			}).exec().then(function(_review){
				review = _review;
				done();
			}).then(null, done);
		});

		it('deletes a review', function(done){
			agent
				.delete('/api/reviews/' + review._id)
				.expect(200)
				.end(done)
		});
	});

})