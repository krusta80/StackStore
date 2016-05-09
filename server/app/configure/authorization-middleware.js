//Access Control
module.exports = { 
    isUser: function(req, res, next){
        var sessionUser = req.user; //(Admins are considered users as well)
        if(!sessionUser) res.status(401).send("Error: Not logged in as user"); 
        else next();
    },
    isAdmin: function(req, res, next){
        var sessionUser = req.user;
        if(!sessionUser) res.status(401).send("Error: Not logged in as user");
        else if(!userIsAdmin(sessionUser)) res.status(401).send("Error: Not an admin");
        else next();
    },
    isAdminOrSelf: function (req, res, next){
        var sessionUser = req.user;
        if(!sessionUser) res.status(401).send("Error: Not logged in as user");
        else if(!userIsAdmin(sessionUser) && !sessionUser.equals(req.requestedUser)) res.status(401).send("Error: Not admin or self");
        else next();
    },
    isAdminOrOwner: function(req, res, next){
        var ownerId = req.requestedObject.userId;
        if(typeof ownerId === 'object')
            ownerId = ownerId._id;

        console.log("req.user", req.user);
        if(!req.user) 
            res.status(401).send("Error: Not logged in as user");
        else if(!userIsAdmin(req.user) && String(req.user._id) !== String(ownerId)) 
            res.status(401).send("Error: Not admin or owner");
        else 
            next();
    },
    isAdminOrResident: function(req, res, next){
        var sessionUser = req.user;

        //console.log("\n\n\nsessionUser", sessionUser, "\n\n\nrequestedUser", req.requestedUser, "\n\n\nrequestedObject", req.requestedObject)
        if(!sessionUser) 
            res.status(401).send("Error: Not logged in as user");
        else if(!userIsAdmin(sessionUser) && !(String(sessionUser._id) === String(req.requestedObject.userId._id))) 
            res.status(401).send("Error: Not admin or owner");
        else next();
    },
    isAdminOrAuthor: function(req, res, next){
        var sessionUser = req.user;
        if(!sessionUser) res.status(401).send("Error: Not logged in as user");
        else if(!userIsAdmin(sessionUser) && !(String(sessionUser._id) === String(req.requestedObject.user))) res.status(401).send("Error: Not admin or author");
        else next();
    },
    isNotSelf: function (req, res, next){
        var sessionUser = req.user;
        if(sessionUser.equals(req.requestedUser)) next(res.status(401).send("Error: Cannot take this action on self"));
        else next();
    }
};

//Helper
function userIsAdmin(user){
    if(user.role === 'Admin'){
        return true;
    }

    return false;
}
