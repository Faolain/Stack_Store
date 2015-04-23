'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/tutorial', require('./tutorial'));
router.use('/members', require('./members'));

//Animals router
router.use('/animals', require('./animals'));

//Search router
router.use('/search', require('./search'));

router.use("/cart",require('./shoppingCart'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});