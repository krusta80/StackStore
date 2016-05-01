// Require our models -- these should register the model into mongoose
// so the rest of the application can simply call mongoose.model('User')
// anywhere the User model needs to be used.
module.exports = {
	Address: require('./address'),
	Category: require('./category'),
	Order: require('./order'),
	Product: require('./product'),
	Review: require('./review'),
	User: require('./user')
};
