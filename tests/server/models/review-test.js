var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var expect = require('chai').expect;
var mongoose = require('mongoose');
var Review = require('../../../server/db/models/review');

describe('Review', function(){
	beforeEach('Establish DB connection', function (done) {
        if (!mongoose.connection.db)// return done();
            mongoose.connect(dbURI);
        done();
    });

	it('has productId, userId, title, stars, and description', function(done){
		var review = new Review({
			productId: '123',
			userId: '456',
			title: 'Funky Title',
			stars: 5,
			description: 'I liked this product'
		});

		review.save()
		.then(function(savedReview){
			expect(savedReview.productId).to.equal('123');
			expect(savedReview.userId).to.equal('456');
			expect(savedReview.title).to.equal('Funky Title');
			expect(savedReview.stars).to.equal(5);
			expect(savedReview.description).to.equal('I liked this product');
			done();
		});
	});

	it('requires productId', function(done){
		var review = new Review({
			//productId: '123',
			userId: '456',
			title: 'Funky Title',
			stars: 5,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	xit('requires userId', function(done){
		var review = new Review({
			productId: '123',
			// userId: '456',
			title: 'Funky Title',
			stars: 5,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	xit('requires title', function(done){
		var review = new Review({
			productId: '123',
			userId: '456',
			// title: 'Funky Title',
			stars: 5,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	xit('stars', function(done){
		var review = new Review({
			productId: '123',
			userId: '456',
			title: 'Funky Title',
			// stars: 5,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	xit('requires description', function(done){
		var review = new Review({
			productId: '123',
			userId: '456',
			title: 'Funky Title',
			stars: 5
			// description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	xit('requires a star value of at least 1', function(done){
		var review = new Review({
			productId: '123',
			userId: '456',
			title: 'Funky Title',
			stars: 0,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	xit('requires a star value of at most 5', function(done){
		var review = new Review({
			productId: '123',
			userId: '456',
			title: 'Funky Title',
			stars: 6,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});
});



