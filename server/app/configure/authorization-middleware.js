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
        var sessionUser = req.user;
        if(!sessionUser) res.status(401).send("Error: Not logged in as user");
        else if(!userIsAdmin(sessionUser) && !(String(sessionUser._id) === String(req.requestedObject.userId))) res.status(401).send("Error: Not admin or owner");
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
