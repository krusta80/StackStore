var mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	description: String,
	active: Boolean,//default value?
	origId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category'
	},//the category belongs to another category?
	dateCreated: {
		type: Date,
		default: Date.now
	},
	dateModified: {
		type: Date
	}
});

module.exports = mongoose.model('Category', categorySchema);
