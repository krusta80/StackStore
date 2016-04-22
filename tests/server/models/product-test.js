var expect = require('chai').expect;
var Product = require('../server/db/models/product');

describe('Products', function(){
	it('has title, categories, price and inventoryQty and active required', function(done){
		var product = new Product({
			title: 'Cool Thing',
			categories: ['cheap'] ,
			price: 2,
			inventoryQty: 50,
			active: true
		});

		product.save().then(function(savedProduct){
			expect(savedProduct.tile).to.equal('Cool Thing');
			expect(savedProduct.categories).to.equal(['cheap']);
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
			active: true,
			origId: 12345
		});

		product.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	it('requires categories', function(done){
		var product = new Product({
			title: 'Cool Thing',
			// categories: ['cheap'] ,
			price: 2,
			inventoryQty: 50,
			active: true,
			origId: 12345
		});

		product.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	it('requires price', function(done){
		var product = new Product({
			title: 'Cool Thing',
			categories: ['cheap'] ,
			// price: 2,
			inventoryQty: 50,
			active: true,
			origId: 12345
		});

		product.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	it('requires inventoryQty', function(done){
		var product = new Product({
			title: 'Cool Thing',
			categories: ['cheap'] ,
			price: 2,
			// inventoryQty: 50,
			active: true,
			origId: 12345
		});

		product.validate(function(err){
			expect(err).to.be.an('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	it('has description, imageUrls, reviews, unitType, dateCreated and dateModified', function(done){
		var product = new Product({
			title: 'Cool Thing',
			categories: 'cheap' ,
			price: 2,
			inventoryQty: 50,
			active: true,
			origId: 12345,
			description: 'Great description',
			imageUrls: ['www.my-image.com'],
			reviews: ['112233', '223344'],
			unitType: 'this-type'
		});

		product.save().then(function(savedProduct){
			expect(savedProduct.description).to.equal('Great description');
			expect(savedProduct.imageUrls).to.equal(['www.my-image.com']);
			expect(savedProduct.reviews).to.equal(['112233', '223344']);
			expect(savedProduct.unitType).to.equal('this-type');
			expect(savedProduct.dateCreated).to.be.an.instanceOf(Date);
			expect(savedProduct.dateModified).to.exist;
			done();
		}).then(null, done);
	});
});