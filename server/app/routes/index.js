'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/tutorial', require('./tutorial'));
router.use('/members', require('./members'));

//Animals router
router.use('/animals', require('./animals'));

//Orders router
router.use('/orders', require('./orders'));

//Admin router
router.use('/admin', require('./admin'));

//Admin router
router.use('/shoppingcart', require('./shoppingCart'));

//Search router
router.use('/search', require('./search'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});