// Require our models -- these should register the model into mongoose
// so the rest of the application can simply call mongoose.model('User')
// anywhere the User model needs to be used.
var User = require('./user');
var Address = require('./address');
var Order = require('./order');

module.exports = {
	User: User,
	Address: Address,
	Order: Order
}