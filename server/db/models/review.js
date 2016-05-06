var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		required: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	title: {
		type: String,
		required: true
	},
	stars: {
		type: Number,
		min: [0, 'stars number should not be below 0'],
		max: [5, 'stars number should not be over 5'],
		required: true
	},
	description: {
		type: String,
		required: true,
		minlength: 2
	},
	dateCreated: {
		type: Date,
		default: Date.now
	},
	dateModified: {
		type: Date
	}
});

module.exports = mongoose.model('Review', reviewSchema);