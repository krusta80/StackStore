'use strict';
var router = require('express').Router();
module.exports = router;

// router.use('/addresses', require('./addresses'));
// router.use('/members', require('./members'));
// router.use('/orders', require('./orders'));
router.use('/users', require('./users'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});
