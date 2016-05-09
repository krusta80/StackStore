'use strict';
var mongoose = require('mongoose');
var Address = require('./address')
var Product = require('./product')
var User = require('./user')

var schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    sessionId: String,
    email: String,
    lineItems: { type: [{
                        prod_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'}, 
                        quantity: Number,
                        price: Number
                    }],
                    minimum: 1
                    //,required: true (Causes validation errors with current tests)
            },
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

schema.set('toJSON', {
    virtuals : true
});

schema.virtual('itemCount').get(function(){
    var sum = 0;
    this.lineItems.forEach(function(lineItem){
        sum += lineItem.quantity;
    })

    return sum;
})

schema.virtual('subtotal').get(function(){
    var sum = 0;
    this.lineItems.forEach(function(lineItem){
        sum += (lineItem.price * lineItem.quantity);
    })

    return sum;
})

schema.virtual('total').get(function(){
    if(this.billingAddress){
       var state = this.billingAddress.state; 
       return this.subtotal + (1 * (getSalesTaxPercent(state) / 100));
    } 

    return undefined;
})

schema.virtual('numItems').get(function(){
    var count = 0;

    this.lineItems.forEach(function(lineItem){
        count = count + lineItem.quantity;
    })

    return count;
})


schema.methods.timestampStatus = function(){
    //Test - What happens if field doesn't exist on model?
    var field = "date" + this.status.charAt(0).toUpperCase() + this.status.slice(1);
    this[field] = Date.now();
    return this;
}

schema.pre('validate', function(next) {
    if (this.status !== 'Cart' && !this.userId && !this.email) {
        next(Error('Must have a user ID or email address!'));
    } else {
        next();
    }
});

schema.pre('save', function (next) {

    if(this.isNew){
        this.dateCreated = Date.now();
    }
    else
        this.timestampStatus(); // maybe change the wording of this to updateStatusTimestamp?

    next();
});

module.exports = mongoose.model('Order', schema);

//Helpers
function getSalesTaxPercent(state){
    var taxTable = {
        AL: 4.00, AK: 0.00, AZ: 5.60, AR: 6.50, CA: 7.50, CO: 2.90, CT: 6.35, DE: 0.00, FL: 6.00,
        GA: 4.00, HI: 4.00, ID: 6.00, IL: 6.35, IN: 7.00, IA: 6.00, KS: 6.50, LA: 4.00, ME: 5.50, 
        MD: 6.00, MA: 6.25, MI: 6.00, MN: 6.875, MS: 7.00, MO: 4.4225, MT: 0.00, NE: 5.50, NV: 6.85,
        NH: 0.00, NJ: 7.00, NM: 5.125, NY: 4.00, NC: 4.75, ND: 5.00, OH: 5.75, OK: 4.50, OR: 0.00,
        PA: 6.00, RI: 7.00, SC: 6.00, SD: 4.00, TN: 7.00, TX: 6.35, UT: 5.95, VT: 6.00, VA: 5.30, 
        WA: 6.50, WV: 6.00, WI: 5.00, WY: 4.0
    }

    return taxTable[state];
}

