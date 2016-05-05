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
var faker = require('faker'); 
var User = mongoose.model('User');
var Address = mongoose.model('Address');
var Order = mongoose.model('Order');
var Category = mongoose.model('Category');
var Product = mongoose.model('Product');
var Review = mongoose.model('Review');
var wipeCollections = function () {
    var removeUsers = User.remove({});
    var removeAddresses = Address.remove({});
    var removeOrders = Order.remove({});
    var removeCategories = Category.remove({});
    var removeProducts = Product.remove({});
    var removeReviews = Review.remove({});
    return Promise.all([
        removeUsers,
        removeAddresses,
        removeOrders,
        removeCategories,
        removeProducts,
        removeReviews
    ]);
};
var generateRandomCategory = function() {
    return {
        name: faker.commerce.department(),
        description: faker.lorem.sentence()
    };
};

var generateRandomProduct = function(categoryIds) {
    return {
        title: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        imageUrls: [faker.image.imageUrl()+'/?v='+Math.random().toString(36).slice(3,10),
        			faker.image.imageUrl()+'/?v='+Math.random().toString(36).slice(3,10),
        			faker.image.imageUrl()+'/?v='+Math.random().toString(36).slice(3,10)],
        categories: categoryIds,
        price: faker.finance.amount(),
        inventoryQty: Math.floor(Math.random()*100),
        active: faker.random.boolean()
    };
};
var generateRandomAddress = function(userId) {
    return {
        label: faker.random.locale(),
        userId: userId,
        name: faker.name.firstName()+' '+faker.name.lastName(),
        address1: faker.address.streetAddress(),
        address2: faker.address.secondaryAddress(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
        active: faker.random.boolean()
    };
};
var generateRandomReview = function(productId, userId) {
    return {
        product: productId,
        user: userId,
        title: faker.company.catchPhrase(),
        stars: Math.ceil(Math.random()*5),
        description: faker.lorem.paragraph(),
        dateCreated: faker.date.past()
    };
};
var generateRandomOrder = function(user, products, shippingAddress, billingAddress) {
    var statuses = ['Ordered','Notified','Shipped','Delivered'];
    var dateFields = statuses.map(function(status) {
        return 'date'+status;
    });
    var index = Math.floor(Math.random()*statuses.length);

    var ret = {
        userId: user.origId,
        email: user.email,
        invoiceNumber: 'INV000'+Math.random().toString(10).slice(3,8),
        shippingAddress: shippingAddress,
        billingAddress: billingAddress,
        status: statuses[index]
    };

    for(var i = 0; i <= index; i++) {
        ret[dateFields[i]] = faker.date.past();
        while(i > 0 && ret[dateFields[i]] < ret[dateFields[i-1]])
            ret[dateFields[i]] = faker.date.past();
    }

    var lineItems = [];
    var lineCount = Math.ceil(Math.random()*5);

    for(var i = 0; i < lineCount; i++) {
        var product = products[Math.floor(Math.random()*products.length)];
        var qty = Math.ceil(Math.random()*5);
        lineItems.push({prod_id: product._id, quantity: qty, price: product.price});
    }
    ret.lineItems = lineItems;

    return ret;
};
var seedUsers = function () {
   console.log("   -Seeding users")
            
   var users = [
        {
            email: 'jag47@cornell.edu',
            password: 'potus',
            firstName: 'John',
            lastName: 'Gruska',
            middleName: 'Anthony',
            role: 'Admin',
            active: true,
            pendingPasswordReset: false,
            dateCreated: Date.now()
        },
        {
            email: 'krusta80@aol.com',
            password: 'yougotmail',
            firstName: 'Jay',
            lastName: 'Ginsta',
            role: 'User',
            active: true,
            pendingPasswordReset: false,
            dateCreated: Date.now()
        },
        {
            email: 'david@yahoo.com',
            password: 'ohhhbaby',
            firstName: 'David',
            lastName: 'Yang',
            role: 'User',
            active: true,
            pendingPasswordReset: false,
            dateCreated: Date.now(),
            dateModified:  Date.now()
        }
    ];
    return User.create(users);
};
var seedCategories = function(reps){
    console.log("   -Seeding categories")
    var categories = [];
    for(var i = 0; i < reps; i++)
        categories.push(generateRandomCategory());
    return Category.create(categories);
};
var seedProducts = function(reps, categories){
    console.log("   -Seeding products")
    var products = [];

    for(var i = 0; i < reps; i++) {
        if(i%3 === 0)
        	products.push(generateRandomProduct([categories[Math.floor(Math.random()*categories.length)],categories[Math.floor(Math.random()*categories.length)]]));
        else
        	products.push(generateRandomProduct([categories[Math.floor(Math.random()*categories.length)]]));
	}

    return Product.create(products);
}
var seedReviews = function(reps, products, users){
    console.log("   -Seeding reviews")
    var reviews = [];
    for(var i = 0; i < reps; i++)
        reviews.push(generateRandomReview(products[Math.floor(Math.random()*products.length)], users[Math.floor(Math.random()*users.length)]));
    return Review.create(reviews);
}
var seedAddresses = function(reps, users) {
    console.log("   -Seeding addresses");
    var addresses = [];
    for(var i = 0; i < reps; i++)
        addresses.push(generateRandomAddress(users[Math.floor(Math.random()*users.length)]));
    return Address.create(addresses);  
};

var seedOrders = function(reps, addresses, users, products) {
    console.log("   -Seeding orders")
    var orders = [];
    for(var i = 0; i < reps; i++)
        orders.push(generateRandomOrder(users[Math.floor(Math.random()*users.length)], products, addresses[Math.floor(Math.random()*addresses.length)], addresses[Math.floor(Math.random()*addresses.length)]));
    return Order.create(orders);      
};

var addReviewsToProducts = function(products, reviews) {
	var productHash = {};
	products.forEach(function(product) {
		productHash[product._id] = product;
	});
	reviews.forEach(function(review) {
		productHash[review.product.id].reviews.push(review);
		productHash[review.product.id].averageStars = (productHash[review.product.id].averageStars*(productHash[review.product.id].reviews.length-1) + review.stars)/productHash[review.product.id].reviews.length;
	});
	
	var saveProducts = products.map(function(product){
           return product.save();
    });
   	Promise.all(saveProducts)
	.then(function(products) {
		//console.log(products[0]);
	})
	.catch(function(err) {
		console.log("ERROR:",err);
	})
};

var _users;
var _products;
var _categories;
var _addresses;
var _orders;
var _reviews;
connectToDb
    .then(function () {
        return wipeCollections();
    })
    .then(function () {
        return seedUsers();
    })
    .then(function (users) {
        _users = users;
        return seedCategories(10);
    })
    .then(function (categories) {
        _categories = categories;
        return seedProducts(1000, categories);
    })
    .then(function (products) {
        _products = products;
        return seedReviews(10000, _products, _users);
    })
    .then(function (reviews) {
        _reviews = reviews;
        addReviewsToProducts(_products, _reviews);
        return seedAddresses(10, _users);
    })
    .then(function (addresses) {
        _addresses = addresses;
        return seedOrders(100, addresses, _users, _products);
    })
    .then(function (orders) {
        _orders = orders;
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    })
    .catch(function (err) {
        console.error(err);
        process.kill(1);
    });