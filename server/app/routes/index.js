'use strict';
var router = require('express').Router();
module.exports = router;


//Animals router
router.use('/animals', require('./animals'));
router.use('/orders', require('./orders'));
router.use('/users', require('./users'));
router.use('/categories', require('./categories'));
router.use("/cart",require('./shoppingCart'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});