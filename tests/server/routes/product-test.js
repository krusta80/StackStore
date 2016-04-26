var mongoose = require('mongoose');
require('../../../server/db/models');
var Review = mongoose.model('Review');
var Product = mongoose.model('Product');
var Category = mongoose.model('Category');
var User = mongoose.model('User');

var expect = require('chai').expect;

var dbURI = 'mongodb://localhost:27017/testingDB';
//var clearDB = require('mocha-mongoose')(dbURI);

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

describe ('Product Route', function(){
	beforeEach('Establish DB Connection', function(done){
		if (mongoose.connection.db) return done();
		mongoose.connect(dbURI,done);
	});

	// afterEach('Clear test database', function(done){
	// 	clearDB(done);
	// });

	describe('GET All Products', function(){
		it('responds with an array via JSON', function(done){
			agent
				.get('/api/products')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res){
					expect(res.body).to.be.an.instanceOf(Array);
				})
				.end(done);
		});

		it('returns a product if there is one in the DB', function(done){
			var product = generateNewProduct();

			product.save().then(function(){
				agent
					.get('/api/products')
					.expect(200)
					.expect(function(res){
						expect(res.body).to.be.an.instanceOf(Array);
						expect(res.body[0].title).to.contain('Cool');
					})
					.end(done);
			}).then(null, done);
		});
	});

	describe('GET One Product', function(){
		var product;
		before(function(done){
			product = generateNewProduct();
			product.save().then(function(){
				done();
			}, done);
		});

		it('retrieves one product and responds with an array via JSON', function(done){
			agent
				.get('/api/products/'+product._id)
				.expect(200)
				.expect(function(res){
					expect(res.body.title).to.equal('Cool title');
				})
				.end(done);
		});

		it('fails and returns a 404 error when you pass in a bad id', function(done){
			agent
				.get('/api/products/9z1')
				.expect(404)
				.end(done);
		});
	});

	describe('POST products', function(){
		it('creates a new product', function(done){
			agent
				.post('/api/products')
				.send({
					title: 'Cool title',
					categories: [generateNewCategory()],
					price: 3,
					inventoryQty: 50,
					active: true
				})
				.expect(200)
				.expect(function(res){
					expect(res.body._id).to.not.be.an('undefined');
				})
				.end(done);
		});

		it('does not create a product without a title and returns a 500 error', function(done){
			agent
				.post('/api/products')
				.send({
					price: 3,
					inventoryQty: 50,
					active: true
				})
				.expect(500)
				.end(done);
		});

		it('saves the product to the DB', function(done){
			Product.findOne({
				title:'Cool title'
			}).exec().then(function(product){
				expect(product).to.exist;
				expect(product.price).to.equal(3);
				done();
			})
			.catch(function(err){
				done(err)
			})
		});
	});

	describe('PUT Products', function(){
		var product;
		before(function(done){
			Product.findOne({
				title: 'Cool title'	
			}).exec().then(function(_product){
				product = _product;
				done();
			}).then(null, done);
		});

		it('updates the dateModified', function(done){
			agent
				.put('/api/products/' +product._id)
				.expect(200)
				.expect(function(res){
					expect(res.body.dateModified).to.not.be.null;
					expect(res.body.dateModified).to.not.be.undefined;
				})
				.end(done);
		});
	});

	describe('DELETE Products', function(){
		var product;
		before(function(done){
			Product.findOne({
				title: 'Cool title'
			}).exec().then(function(_product){
				product = _product;
				done();
			})
		});

		it ('deletes a product', function(done){
			agent
				.delete('/api/products/' +product._id)
				.expect(200)
				.end(done)
		});

	});

});