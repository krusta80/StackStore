'use strict';
var chalk = require('chalk');
var https = require('https');
var fs = require('fs');

// Requires in ./db/index.js -- which returns a promise that represents
// mongoose establishing a connection to a MongoDB database.
var startDb = require('./db');

var server;

//	Check for existance of necessary pem files
try {
	var secureConfig = {
		key: fs.readFileSync(__dirname + '/../key.pem'),
		cert: fs.readFileSync(__dirname + '/../cert.pem')
	}
	server = https.createServer(secureConfig);
	console.log("Running https!");

	// set up plain http server
	var http = express.createServer();

	// set up a route to redirect http to https
	http.get('*',function(req,res){  
	    res.redirect('https://'+req.hostname);
	})

	http.listen(process.env.PORT);
	process.env.PORT = 443;
	
}
catch(err) {
	console.log("No key and/or cert file found...going http!")
	server = require('http').createServer();	
}

var createApplication = function () {
    var app = require('./app');
    server.on('request', app); // Attach the Express application.
    require('./io')(server);   // Attach socket.io.
};

var startServer = function () {

    var PORT = process.env.PORT || 1337;

    server.listen(PORT, function () {
        console.log(chalk.blue('Server started on port', chalk.magenta(PORT)));
    });

};

startDb.then(createApplication).then(startServer).catch(function (err) {
    console.error(chalk.red(err.stack));
    process.kill(1);
});
