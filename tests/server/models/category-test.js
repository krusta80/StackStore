var expect = require('chai').expect;
var Category = require('../server/db/models/category');

describe('Categories', function(){
	it('has name', function(done){
		var category = new Category({
			name: 'Cool Category'
		});

		category.save().then(function(savedCategory){
			expect(savedCategory.name).to.equal('Cool Category');
			done();
		}).then(null, done);
	});

	it('requires name', function(done){
		var category = new Category({
		});

		category.validate(function(err){
			expect(err).to.be.an.('object');
			expect(err.message).to.exist;
			done();
		}).then(null, done);
	});

	it('has description, active and origId', function(done){
		var category = new Category({
			name: 'Cool Category',
			description: 'Great description',
			active: true,
			origId: '112233'
		});

		category.save().then(function(savedCategory){
			expect(savedCategory.name).to.equal('Cool Category');
			expect(savedCategory.description).to.equal('Great description');
			expect(savedCategory.active).to.equal(true);
			expect(savedCategory.origId).to.equal('112233');
		});
	});

	it('has description, active and origId', function(done){
		var category = new Category({
			name: 'Cool Category',
			description: 'Great description',
			active: true,
			origId: '112233'
		});

		category.save().then(function(savedCategory){
			expect(savedCategory.name).to.equal('Cool Category');
			expect(savedCategory.description).to.equal('Great description');
			expect(savedCategory.active).to.equal(true);
			expect(savedCategory.origId).to.equal('112233');
		})
	});

	it('has dateCreated and dateModified', function(done){
		var category = new Category({
			name: 'Cool Category'
		});

		category.save().then(function(savedCategory){
			expect(savedCategory.dateCreated).to.be.an.instanceOf(Date);
			expect(savedCategory.dateModified).to.exist;
		})
	});
});