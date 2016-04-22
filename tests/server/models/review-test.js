var expect = require('chai').expect;
var Review = require('../server/db/models/review');

describe('Review', function(){
	it('has productId, userId, title, stars, and description', function(done){
		var review = new Review({
			productId: '123',
			userId: '456',
			title: 'Funky Title',
			stars: 5,
			description: 'I liked this product'
		});

		review.save().then(function(savedReview){
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
			expect(err).to.be.an.('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	it('requires userId', function(done){
		var review = new Review({
			productId: '123',
			// userId: '456',
			title: 'Funky Title',
			stars: 5,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an.('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	it('requires title', function(done){
		var review = new Review({
			productId: '123',
			userId: '456',
			// title: 'Funky Title',
			stars: 5,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an.('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	it('stars', function(done){
		var review = new Review({
			productId: '123',
			userId: '456',
			title: 'Funky Title',
			// stars: 5,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an.('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	it('requires description', function(done){
		var review = new Review({
			productId: '123',
			userId: '456',
			title: 'Funky Title',
			stars: 5
			// description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an.('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	it('requires a star value of at least 1', function(done){
		var review = new Review({
			productId: '123',
			userId: '456',
			title: 'Funky Title',
			stars: 0,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an.('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	it('requires a star value of at most 5', function(done){
		var review = new Review({
			productId: '123',
			userId: '456',
			title: 'Funky Title',
			stars: 6,
			description: 'I liked this product'
		});

		review.validate(function(err){
			expect(err).to.be.an.('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});
});



