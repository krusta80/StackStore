'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    label: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    address1: {
        type: String,
        required: true
    },
    address2: String,
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true,
        enum: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']
    },
    zip: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true //Not in spec, but I feel like this makes sense.
    },
    origId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    dateCreated: {
        type: Date
    },
    dateModified: {
        type: Date
    }
});

mongoose.model('Address', schema);