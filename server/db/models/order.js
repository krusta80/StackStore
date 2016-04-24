'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    sessionId: String,
    email: String,
    lineItems: [{
        prod_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'}, 
        quantity: Number,
        price: Number}], //To-do: Replace lineItems.prod_id with reference to "Product" 
    invoiceNumber: String,
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Address'
    },
    billingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    status: {
        type: String, 
        required: true,
        enum: ['Cart', 'Ordered', 'Notified', 'Shipped', 'Delivered', 'Canceled']
    },
    dateCreated: Date,
    dateOrdered: Date,
    dateNotified: Date,
    dateShipped: Date, 
    dateDelivered: Date, 
    dateCanceled: Date
});

schema.methods.timestampStatus = function(){
    //Test - What happens if field doesn't exist on model?
    var field = "date" + this.status.charAt(0).toUpperCase() + this.status.slice(1);
    this[field] = Date.now();
    return this;
}

schema.pre('save', function (next) {

    if(this.isNew){
        this.dateCreated = Date.now();
    }

    next();

});

module.exports = mongoose.model('Order', schema);