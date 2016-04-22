/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');
var User = mongoose.model('User');
var Category = mongoose.model('Category');
var Product = mongoose.model('Product');
var Review = mongoose.model('Review');

var wipeCollections = function () {
    var removeUsers = User.remove({});
    var removeCategories = Category.remove({});
    var removeProducts = Product.remove({});
    var removeReviews = Review.remove({});
    return Promise.all([
        removeUsers,
        removeCategories,
        removeProducts,
        removeReviews
    ]);
};

var seedUsers = function () {

    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password'
        },
        {
            email: 'obama@gmail.com',
            password: 'potus'
        }
    ];

    return User.create(users);

};

var seedCategories = function(){
    var categories = [
        {
            name: 'fruit',
            description: 'good'
        },
        {
            name: 'meat'
        }
    ]
    return Category.create(categories);
};

var seedProducts = function(categories){
    var products = [
        {
            title: 'foo',
            categories: categories[0],
            price: 1,
            inventoryQty: 1
        },
        {
            title: 'bar',
            categories: categories,
            price: 3,
            inventoryQty: 3
        }
    ];

    return Product.create(products);
}

var seedReviews = function(products, users){
    var reviews = [
        {
            product: products[0],
            user: users[0],
            title: 'perfect',
            stars: 3,
            description: 'nice team'
        },
        {
            product: products[1],
            user: users[1],
            title: 'blah',
            description: 'awesome team',
            stars: 1
        }
    ];

    return Review.create(reviews);
}

var _users;
var _products;
var _categories;

connectToDb
    .then(function () {
        return wipeCollections();
    })
    .then(function () {
        return seedUsers();
    })
    .then(function (users) {
        _users = users;
        return seedCategories();
    })
    .then(function (categories) {
        _categories = categories;
        return seedProducts(categories);
    })
    .then(function (products) {
        _products = products;
        return seedReviews(_products, _users);
    })
    .then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    })
    .catch(function (err) {
        console.error(err);
        process.kill(1);
    });
