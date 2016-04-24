var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var expect = require('chai').expect;
var mongoose = require('mongoose');
var Product = require('../../../server/db/models/product');
var Category = require('../../../server/db/models/category');
var User = require('../../../server/db/models/user');

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

describe('Products', function(){
	beforeEach('Establish DB connection', function (done) {
        if (!mongoose.connection.db)// return done();
            mongoose.connect(dbURI);
        done();
    });
	it('has title, categories, price and inventoryQty and active required', function(done){
		var product = generateNewProduct();

		product.save().then(function(savedProduct){
			expect(savedProduct.title).to.equal('Cool Thing');
			expect(savedProduct.categories[0].name).to.equal('Cheap');
			expect(savedProduct.price).to.equal(2);
			expect(savedProduct.inventoryQty).to.equal(50);
			expect(savedProduct.active).to.equal(true);
			done();
		}).then(null, done);
	});

	it('requires title', function(done){
		var product = new Product({
			//title: 'Cool Thing',
			categories: ['cheap'] ,
			price: 2,
			inventoryQty: 50,
			active: true
		});

		product.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.errors.title.message).to.equal('Path `title` is required.');
			done();
		})
	});

	it('requires categories', function(done){
		var product = new Product({
			title: 'Cool Thing',
			// categories: ['cheap'] ,
			price: 2,
			inventoryQty: 50,
			active: true
		});

		product.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.errors.categories.message).to.equal('at least one category required');
			done();
		})
	});

	it('requires price', function(done){
		var product = new Product({
			title: 'Cool Thing',
			categories: ['cheap'] ,
			// price: 2,
			inventoryQty: 50,
			active: true
		});

		product.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.errors.price.message).to.equal('Path `price` is required.');
			done();
		})
	});

	it('requires inventoryQty', function(done){
		var product = new Product({
			title: 'Cool Thing',
			categories: ['cheap'] ,
			price: 2,
			// inventoryQty: 50,
			active: true
		});

		product.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.errors.inventoryQty.message).to.equal('Path `inventoryQty` is required.');
			done();
		})
	});

	it('has description, imageUrls, unitType, dateCreated and dateModified', function(done){
		var product = new Product({
			title: 'Cool Thing',
			categories: [generateNewCategory()] ,
			price: 2,
			inventoryQty: 50,
			active: true,
			description: 'Great description',
			imageUrls: ['www.my-image.com'],
			unitType: 'this-type'
		});

		product.save().then(function(savedProduct){
			expect(savedProduct.description).to.equal('Great description');
			expect(savedProduct.imageUrls[0]).to.equal('www.my-image.com');
			expect(savedProduct.unitType).to.equal('this-type');
			expect(savedProduct.dateCreated).to.be.an.instanceOf(Date);
			expect(Product.schema.paths.dateModified).to.exist;
			done();
		})
		.catch(function(err){
			done(err);
		})
	});
});