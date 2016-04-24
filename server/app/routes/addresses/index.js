'use strict';
var mongoose = require('mongoose');
var router = require('express').Router();
var models = require('../../../db/models');
var Address = models.Address;
module.exports = router;

//Note - Still need to implement access control!

router.get('/:id', function(req, res, next){
    var id = req.params.id;
    Address.findById(id)
    .then(function(address){
        res.status(200).send(address);
    })
    .then(null, next);
})

router.post('/', function(req, res, next){
    Address.create(req.body)
    .then(function(newAddress){
        res.status(200).send(newAddress);
    })
    .then(null, next);
})


router.put('/:id', function(req, res, next){
    Address.findByIdAndUpdate(req.params.id, {modifiedDate: Date.now()})
    .then(function(originalAddress){ 
        var newAddress = req.body; 
        newAddress.origId = originalAddress.origId; 
        return newAddress.save(); 
    })
    .then(function(updatedAddress) {
        res.send(updatedAddress);
    })
    .then(null, next);
});

router.delete('/:id', function(req, res, next){
    Address.findByIdAndUpdate(req.params.id, {modifiedDate: Date.now()}, {new: true})
    .then(function(deletedAddress) {
        res.send(deletedAddress);
    })
    .then(null, next);
})