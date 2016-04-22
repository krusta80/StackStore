var mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: String,
	imageUrls: [String],
	categories: {
		type: [ {type: Schema.Types.ObjectId, ref: 'Category'} ],
		validate: {
			validator: function(val){
				return val.length > 0;
			},
			message: 'at least one category required'
		}
	},
	reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}],
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
		required: true
	},
	origId: {
		type: Schema.Types.ObjectId,
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

var Product = mongoose.model('Product', productSchema);

module.exports = Product;




