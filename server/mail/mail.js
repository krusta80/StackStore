const fs = require('fs');
var Promise = require('bluebird');
var sendgrid_api_key = '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';
var sendgrid  = require('sendgrid')(sendgrid_api_key);

// var params = {
// 	to: 'jag47@cornell.edu',
// 	from: 'admin@gitcommitted.io',
// 	fromname: 'Git Committed',
// 	subject: 'This is a test',
// 	html: '<a href="http://pandora.dyndns.biz:1337">hello world...</a>' 
// };

var getEmailTemplate = function(path) {
	return new Promise(function (resolve, reject) {
	    fs.readFile(__dirname + '/' + path, 'utf8', function(err, html) {
			if(!err)
				resolve(html);
			else
				reject(err);	 
		});
	});
};

var sendEmail = function(params) {
	var email = new sendgrid.Email(params);
	return new Promise(function (resolve, reject) {
	    sendgrid.send(email, function(err, json) {
	    	if(!err)
				resolve(json);
			else
				reject(err);	 	 
	    });
	});
};

module.exports = {

	sendActivation: function(params) {

	}, 

};