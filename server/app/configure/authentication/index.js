'use strict';
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var path = require('path');
var mongoose = require('mongoose');
var UserModel = mongoose.model('User');
var OrderModel = mongoose.model('Order');

var ENABLED_AUTH_STRATEGIES = [
    'local',
    //'twitter',
    //'facebook',
    //'google'
];

module.exports = function (app) {

    
    // First, our session middleware will set/read sessions from the request.
    // Our sessions will get stored in Mongo using the same connection from
    // mongoose. Check out the sessions collection in your MongoCLI.
    app.use(session({
        secret: app.getValue('env').SESSION_SECRET,
        store: new MongoStore({mongooseConnection: mongoose.connection}),
        resave: false,
        saveUninitialized: false
    }));

    // Initialize passport and also allow it to read
    // the request session information.
    app.use(passport.initialize());
    app.use(passport.session());

    // When we give a cookie to the browser, it is just the userId (encrypted with our secret).
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // When we receive a cookie from the browser, we use that id to set our req.user
    // to a user found in the database.
    passport.deserializeUser(function (id, done) {
        UserModel.findById(id, done);
    });

    // Simple /logout route.
    app.get('/logout', function (req, res) {
        console.log("Removing cart id", req.session.cartId);
        delete req.session.cartId;
        req.logout();
        res.status(200).end();
    });

    // Added by JAG on 04/25/16 to initialize a cart when a new session
    // is created...
    app.use(function (req, res, next) {
        if(!req.session.cartId) {
            console.log("No cart found for this session...creating one now.");
            OrderModel.create({
                sessionId: req.cookies['connect.sid'],
                status: 'Cart',
                dateCreated: Date.now()
            })
            .then(function(cart) {
                req.session.cartId = cart._id;
            })
            .catch(function(err) {
                console.log("ERROR:",err);
            });
        }          
        next();
    });

    
    // We provide a simple GET /session in order to get session information directly.
    // This is used by the browser application (Angular) to determine if a user is
    // logged in already.
    app.get('/session', function (req, res) {
        if (req.user) {
            res.send({ user: req.user.sanitize() });
        } else {
            res.status(401).send('No authenticated user.');
        }
    });

    // Each strategy enabled gets registered.
    ENABLED_AUTH_STRATEGIES.forEach(function (strategyName) {
        require(path.join(__dirname, strategyName))(app);
    });

};
