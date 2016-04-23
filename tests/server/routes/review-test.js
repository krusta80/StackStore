var mongoose = require('mongoose');
require('../../../server/db/models');
var Review = mongoose.model('Review');

var expect = require('chai').expect;

var dbURI = 'mongodb://localhost:27017/testingDB';

var request = require('supertest');
var app = require('../../../server/app');
var agent = request.agent(app);

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
					expect(res.body)to.be.an.instanceOf(Array)
				})
				.end(done)
		});

		it('returns a review if there is one in the DB', function(done){
			var review = new Review({
				product: '123', //placeholder
				user: '456', //placeholder
				title: 'My Review',
				stars: 3,
				description: 'I liked it'
			})

			review.save().then(function(){
				agent
					.get('/api/reviews/')
					.expect(200)
					.expect(function(res){
						.expect(res.body).to.be.an.instanceOf(Array);
						.expect(res.body[0].title).to.equal('My Review');
					})
					.end(done);
			}).then(null, done);
		});

	});

	describe('GET One Review', function(){
		var review;

		before(function(done){
			review = new Review({
				product: '123', //placeholder
				user: '456', //placeholder
				title: 'My Review',
				stars: 3,
				description: 'I liked it'
			})
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

		it('fails and returns a 500 error when you pass a bad ID', function(done){
			agent
				.get('/api/reviews/9282')
				.expect(500)
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
				.PUT('/api/reviews/'+review._id)
				.send({
					description: 'I REALLY liked it'
				})
				.expect(200)
				.expect(function(res){
					expect(res.body.description)
				})
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

		it('deletes a review', function(){
			agent
				.delete('/api/reviews/' + review._id);
				.expect(200)
				.end(done)
		});
	});

})