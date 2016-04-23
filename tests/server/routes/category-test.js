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
	



})