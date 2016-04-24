var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var expect = require('chai').expect;
var mongoose = require('mongoose');
require('../../../server/db/models');

var Category = mongoose.model('Category');

describe('Categories', function(){
    
    beforeEach('Establish DB connection', function (done) {
        if (!mongoose.connection.db)// return done();
            mongoose.connect(dbURI);
        done();
    });

    it('has name', function(done){
        var category = new Category({
            name: 'Cool Category'
        });
    
        category.save()
        .then(function(savedCategory){
            expect(savedCategory.name).to.equal('Cool Category');
            done();
        })
        .catch(function(err) {
            console.log("error -> ",err);
            done();    
        });

        
    });

    it('requires name', function(done){
        var category = new Category({
        });

        category.validate(function(err){
            expect(err).to.be.an('object');
            expect(err.errors.name.message).to.equal('Path `name` is required.');
            done();
        });
    });

    it('has description, active and origId', function(done){
        var category = new Category({
            name: 'Cool Category',
            description: 'Great description',
            active: true
        });

        category.save().then(function(savedCategory){
            expect(savedCategory.name).to.equal('Cool Category');
            expect(savedCategory.description).to.equal('Great description');
            expect(savedCategory.active).to.equal(true);
            expect(savedCategory.origId).to.equal(savedCategory._id);
            done();
        }).catch(done);
    });

    it('has description, active and origId', function(done){
        var category = new Category({
            name: 'Cool Category',
            description: 'Great description',
            active: true
        });

        category.save().then(function(savedCategory){
            expect(savedCategory.name).to.equal('Cool Category');
            expect(savedCategory.description).to.equal('Great description');
            expect(savedCategory.active).to.equal(true);
            expect(savedCategory.origId).to.equal(savedCategory._id);
            done();
        }).catch(done);
    });

    it('has dateCreated and dateModified', function(done){
        var category = new Category({
            name: 'Cool Category'
        });

        category.save().then(function(savedCategory){
            
            expect(savedCategory.dateCreated).to.be.an.instanceOf(Date);
            expect(savedCategory.dateModified).to.not.exist;
            expect(Category.schema.paths.dateModified).to.exist;
            done();
        }).catch(done);
    });
});