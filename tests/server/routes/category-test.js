var mongoose = require('mongoose');
require('../../../server/db/models');
var Category = mongoose.model('Category');

var expect = require('chai').expect;

var dbURI = 'mongodb://localhost:27017/testingDB';

var request = require('supertest');
var app = require('../../../server/app');
var agent = request.agent(app);

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
					expect(res.body)to.be.an.instanceOf(Array);
				})
				.end(done);
		});

		it('returns a category if there is one in the DB', function(){
			var category = new Category({
				name: 'Cool Category',
				description: 'This is for cool stuff'
			})

			category.save().then(function(){
				agent
					.get('/api/categories/')
					.expect(200)
					.expect(function(res){
						.expect(res.body).to.be.an.instanceOf(Array)
						.expect(res.body[0].name.to.equal('Cool Category'))
					})
					.end(done);
			}).then(null, done);
		});
	});

	describe('GET One Category', function(){
		var category;

		before(function(done){
			category = new Category({
				name: 'Awesome Category',
				description: 'This is for awesome stuff'
			})
			category.save().then(function(){
				done();
			}, done);
		});

		it('retrieves one category and responds with an array via JSON', function(done){
			agent
				.get('/api/categories/' + category._id)
				.expect(200)
				.expect(function(res){
					expect(res.body.name).to.equal('Awesome Category');
				})
				.end(done);
		});

		it('fails and returns a 500 error when you pass a bad ID', function(done){
			agent
				.get('/api/categories/9xx9')
				.expect(500)
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
					expect(res.body.category.name).to.equal('Jammin Category');
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
				title: 'Jammin Category'
			}).exec().then(function(product){
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
				title: 'Jammin Category'
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
				});
		});

	})

	describe('DELETE Categories', function(){
		var category;
		before(function(done){
			Category.findOne({
				title: 'Jammin Category'
			}).exec().then(function(_category){
				category = _category;
				done();
			}).then(null, done);
		});

		it('deletes a category', function(done){
			agent
				.delete('/api/categories/' + category._id);
				.expect(200)
				.end(done)
		});
	});




});