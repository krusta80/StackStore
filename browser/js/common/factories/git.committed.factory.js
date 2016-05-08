app.factory('GitCommitted', function () {
	return {
		fancify: function(field) {
	        //  converts from camel case to english
	        return field
	                // insert a space before all caps
	                .replace(/([A-Z])/g, ' $1')
	                // uppercase the first character
	                .replace(/^./, function(str){ return str.toUpperCase(); })
	    },
	    dateify: function(field, label) {
	    	var d = new Date(field);
	    	if (label.indexOf("date") === 0 && Object.prototype.toString.call(d) === "[object Date]" && !isNaN(d.getTime())) 
				return d.toLocaleString();
			else
				return field;
	    }
	};


});