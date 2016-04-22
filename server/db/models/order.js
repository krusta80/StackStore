'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    sessionId: String,
    email: String,
    lineItems: [{prod_id: String, quantity: Number, price: Number}], //To-do: Replace lineItems.prod_id with reference to "Product" 
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
    dateCreated: {
        type: Date
    },
    dateModified: {
        type: Date
    }
});

module.exports = mongoose.model('Order', schema);