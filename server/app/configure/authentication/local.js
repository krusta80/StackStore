'use strict';
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Order = mongoose.model('Order');

module.exports = function (app) {

    // When passport.authenticate('local') is used, this function will receive
    // the email and password to run the actual authentication logic.
    var strategyFn = function (email, password, done) {
        User.findOne({ email: email })
            .then(function (user) {
                // user.correctPassword is a method from the User schema.
                if (!user || !user.correctPassword(password)) {
                    done(null, false);
                } else {
                    // Properly authenticated.
                    done(null, user);
                }
            })
            .catch(done);
    };

    passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, strategyFn));

    // A POST /login route is created to handle login.
    app.post('/login', function (req, res, next) {

        var authCb = function (err, user) {

            if (err) return next(err);

            if (!user) {
                var error = new Error('Invalid login credentials.');
                error.status = 401;
                return next(error);
            }

            //  We merge carts (if applicable)
            var oldCart, updatedCart;
            Order.findOne({userId: user.origId, status: 'Cart'})
            .then(function(_oldCart) {
                oldCart = _oldCart;
                if(oldCart && oldCart._id === req.session.cartId)
                    return Promise.reject("Same session...no merge required!");
                return Order.findById(req.session.cartId);
            })
            .then(function(newCart) {
                if(oldCart)
                    oldCart.lineItems.forEach(function(oldLineItem) {
                        var hasItem = false;
                        for(var i = 0; i < newCart.lineItems.length; i++) {
                            if(oldLineItem.prod_id == newCart.lineItems[i].prod_id) {
                                hasItem = true;
                                newCart.lineItems[i].quantity += oldLineItem.quantity;
                            }
                        }
                        if(!hasItem)
                            newCart.lineItems.push(oldLineItem);
                    });
                
                newCart.userId = user.origId;
                return newCart.save();
            })
            .then(function(_updatedCart) {
                updatedCart = _updatedCart;
                console.log("Carts merged...");
                
                if(oldCart)
                    return Order.findByIdAndRemove(oldCart._id)
            })
            .then(function(removedCart) {
                req.logIn(user, function (loginErr) {
                    if (loginErr) return next(loginErr);
                    // We respond with a response object that has user with _id and email.
                    res.status(200).send({
                        user: user.sanitize(),
                        cart: updatedCart
                    });
                });
            })
            .catch(function(err) {
                console.log("ERROR WHILE TRYING TO COMBINE CARTS:", err);
                
                req.logIn(user, function (loginErr) {
                    if (loginErr) return next(loginErr);
                    // We respond with a response object that has user with _id and email.
                    res.status(200).send({
                        user: user.sanitize()
                    });
                });
            });
            
        };

        passport.authenticate('local', authCb)(req, res, next);

    });

};
