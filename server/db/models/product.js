var mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: String,
	imageUrls: [String],
	reviews: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Review'} ],
	averageStars: {
		type: Number,
		default: 0
	},
	categories: {
		type: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Category'} ],
		validate: {
			validator: function(val){
				return val.length > 0;
			},
			message: 'at least one category required'
		}
	},
	price: {
		type: Number,
		required: true,
		min: [0, 'price should not be below 0']
	},
	unitType: String,
	inventoryQty: {
		type: Number,
		required: true,
		min: [0, 'inventoryQty should not be below 0']
	},
	active: {
		type: Boolean,
		required: true,
		//I think default is necessary
		//not sure value is true or false
		default: true 
	},
	origId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product'
	},
	dateCreated: {
		type: Date,
		default: Date.now
	},
	dateModified: {
		type: Date
	}

});


module.exports = mongoose.model('Product', productSchema);




