'use strict';
var mongoose = require('mongoose');
var router = require('express').Router();
var models = require('../../../db/models');
var User = models.User;
module.exports = router;

//Note - Still need to implement access control!

router.get('/', function (req, res, next) {
    User.find({dateModified : {$exists : false }})
    .then(function(users){
        res.send(users);
    })
    .then(null, next);
});

router.get('/fields', function (req, res, next) {
    if(!req.user)
        res.send(readWhitelist.Any);
    res.send(readWhitelist[req.user.role]);
});

router.get('/:id', function(req, res, next){
	var id = req.params.id;
	User.findById(id)
	.then(function(user){
		res.send(user);
	})
	.then(null, next);
})

router.post('/', function(req, res, next){
	User.create(req.body)
	.then(function(newUser){
        User.find({email: newUser.email, _id: {$ne: newUser._id} })
        .then(function(existingUsers){
            if(existingUsers.length > 0){
                res.status(400).send("Please use unique email.")
            }else{
               res.send(newUser);  
            }
        })
	})
	.catch(function(err) {
        console.log(err);
        res.status(500).send(err);
    });
})

//To-do: Need to DELETE certain fields and configure access control.
router.put('/:id', function(req, res, next){
    //Stripping fields example
    //Prevents user from editing own role. Meant to be used in conuunction with isAdminOrSelf middleware.
    //if(req.passport.session.user.equals(req.requestedUser)) delete req.body.role;
    
    console.log("***********CALLED");

	//Find user by ID, add dateModified timestamp, but return ORIGINAL User object
    User.findByIdAndUpdate(req.params.id, {dateModified: Date.now()})
    .then(function(originalUser){
    	;
    	//Create new User object from old object properties + submitted changes
    	var newUser = {};
    	var originalUserObj = originalUser.toObject();
    	for(var key in originalUserObj){
    		if(key != '_id' && key != 'password'){
            	newUser[key] = originalUser[key];
    		}
    	}
    	for(var key in req.body){
    		if(key != '_id') {
                newUser[key] = req.body[key];
            }
        }

        //Save to backend and return
        return User.create(newUser);
    })
    .then(function(updatedUser) {
        res.send(updatedUser);
    })
    .then(null, next);
});

router.delete('/:id', function(req, res, next){
    User.findByIdAndUpdate(req.params.id, {dateModified: Date.now()}, {new: true})
    .then(function(deletedUser) {
        res.send(deletedUser);
    })
    .then(null, next);
})

//Router Param
router.param('id', function(req, res, next, id){
    User.findById(id).exec()
    .then(function(user){
        if(!user) res.status(404).send();
        req.requestedUser = user;
        next();
    })
    .then(next, null);
})

//Access Control
function isUser(req, res, next){
    var sessionUser = req.user; //(Admins are considered users as well)
    if(!sessionUser) next(res.status(401).send("Error: Not logged in as user")); 
    else next();
};

function isAdmin(req, res, next){
    var sessionUser = req.user;
    if(!sessionUser) next(res.status(401).send("Error: Not logged in as user"));
    else if(!userIsAdmin(sessionUser)) next(res.status(401).send("Error: Not an admin"));
    else next();
};

function isAdminOrSelf(req, res, next){
    var sessionUser = req.user;

    if(!sessionUser) next(res.status(401).send("Error: Not logged in as user"));
    else if(!userIsAdmin(sessionUser) && !sessionUser.equals(req.requestedUser)) next(res.status(401).send("Error: Not admin or self"));
    else next();
}

//Helper
function userIsAdmin(user){
    if(user.role === 'Admin'){
        return true;
    }

    return false;
}

//Whitelists
var readWhitelist = {
    Any: ['firstName', 'middleName', 'lastName', 'email'],
    User: ['firstName', 'middleName', 'lastName', 'email', 'dateCreated', 'origId', '_id', 'active', 'pendingPasswordReset', 'role'],
    Admin: ['firstName', 'middleName', 'lastName', 'email', 'password', 'dateCreated', 'origId', '_id', 'active', 'pendingPasswordReset', 'role']
};

var writeWhitelist = {
    Any: [],
    User: ['firstName', 'middleName', 'lastName', 'email'],
    Admin: ['firstName', 'middleName', 'lastName', 'email', 'password', 'active', 'pendingPasswordReset', 'role']
};
