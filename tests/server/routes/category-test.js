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
		title: 'Cool title',
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

describe('Category Route', function(){
	beforeEach('Establish DB Connection', function(done){
		if (mongoose.connection.db) return done();
		mongoose.connect(dbURI, done);
	});

	describe('GET All Categories', function(){
		it('responds with an array via JSON', function(done){
			agent
				.get('/api/categories')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res){
					expect(res.body).to.be.an.instanceOf(Array);
				})
				.end(done);
		});

		it('returns a category if there is one in the DB', function(done){
			var category = generateNewCategory();

			category.save().then(function(){
				agent
					.get('/api/categories/')
					.expect(200)
					.expect(function(res){
						expect(res.body).to.be.an.instanceOf(Array);
						expect(res.body[0].name).to.equal('Cheap');
					})
					.end(done);
			})
			.catch(function(err){
				done(err);
			})
		});
	});

	describe('GET One Category', function(){
		var category;

		before(function(done){
			category = generateNewCategory();
			category.save().then(function(){
				done();
			}, done);
		});

		it('retrieves one category and responds with an array via JSON', function(done){
			agent
				.get('/api/categories/' + category._id)
				.expect(200)
				.expect(function(res){
					//console.log("******RES IS: ", res.body)
					expect(res.body.name).to.equal('Cheap');
				})
				.end(done);
		});

		it('fails and returns a 404 error when you pass a bad ID', function(done){
			agent
				.get('/api/categories/9xx9')
				.expect(404)
				.end(done);
		});
	})

	describe('POST categories', function(){
		it('creates a new category', function(done){
			agent
				.post('/api/categories/')
				.send({
					name: 'Jammin Category',
					description: 'This stuff is jammin'
				})
				.expect(200)
				.expect(function(res){
					expect(res.body.name).to.equal('Jammin Category');
				})
				.end(done);
		});

		it('does not create a category without a name and returns 500', function(done){
			agent
				.post('/api/categories/')
				.send({
					description: 'I have no name'
				})
				.expect(500)
				.end(done);
		});

		it('saves the category to the DB', function(done){
			Category.findOne({
				name: 'Jammin Category'
			}).exec().then(function(category){
				expect(category).to.exist;
				expect(category.description).to.equal('This stuff is jammin');
				done();
			}).then(null, done);
		});
	});

	describe('PUT Categories', function(){
		var category;
		before(function(done){
			Category.findOne({
				name: 'Jammin Category'
			}).exec().then(function(_category){
				category = _category;
				done();
			}).then(null, done);
		});

		it('updates the dateModified', function(done){
			agent
				.put('/api/categories/' + category._id)
				.expect(200)
				.expect(function(res){
					expect(res.body.dateModified.to.not.be.null);
					expect(res.body.dateModified.to.not.be.undefined);
				})
				.end(done);
		});

	})

	describe('DELETE Categories', function(){
		var category;
		before(function(done){
			Category.findOne({
				name: 'Jammin Category'
			}).exec().then(function(_category){
				category = _category;
				done();
			}).then(null, done);
		});

		it('deletes a category', function(done){
			agent
				.delete('/api/categories/' + category._id)
				.expect(200)
				.end(done)
		});
	});




});