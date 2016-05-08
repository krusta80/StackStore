const fs = require('fs');
var Promise = require('bluebird');
var sendgrid_api_key = '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';
var sendgrid  = require('sendgrid')(sendgrid_api_key);

var getEmailTemplate = function(path, variableObject) {
	return new Promise(function (resolve, reject) {
	    fs.readFile(__dirname + '/' + path, 'utf8', function(err, html) {
			if(!err) {
				var ret = Object.keys(variableObject).reduce(function(string, nextVar) {
					var re = new RegExp("\{\{"+nextVar+"\}\}","g");
					return string.replace(re, variableObject[nextVar]);
				}, html);
				resolve(ret);
			}
			else
				reject(err);	 
		});
	});
};

var sendEmail = function(params) {
	params.from = 'admin@gitcommitted.io';
	params.fromName = 'Team Git Committed';
	params.cc = ['johngruska@gmail.com'];
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

var getTemplateAndSend = function(params, templatePath, templateVars) {
	getEmailTemplate(templatePath, templateVars)
	.then(function(html) {
		console.log("fetched template result:", html);
		params.html = html;
		return sendEmail(params);	
	})
	.then(function(message) {
		console.log("Email Response:", message);
		return message;
	})
	.catch(function(err) {
		console.log(err);
		return "SEND MESSAGE TEMPLATE FAILED";
	})
};

module.exports = {

	sendActivation: function(toEmailAddress, activationKey) {
		//	Need to select the activation template and send
		params = {
			to: [toEmailAddress],
			subject: 'Account Activation Required'
		};
		
		return getTemplateAndSend(params, 'activation.html', {activationKey: activationKey})
	}, 

};
