var router = require('express').Router();
var mongoose = require('mongoose');
var Order = require('../../../db/models/order.js');

//Get all the orders for Admin
router.get('/getAllOrders', function (req, res) {

  var obj = {};

  if(req.body.status) obj.status = req.body.status;

  Order.find(obj, function(err, orders) {
    res.send(orders);
  });
});

//Get Order Details
router.get('/getOrderDetails/:id', function (req, res) {
  var id = req.params.id;

  Order.findById(id, function (err, order){
    res.send(order);
  });
});

//Updating Status on Order
router.put('/changeStatus/:id', function (req, res, next) {

  Order.findByIdAndUpdate(req.params.id, req.body, function(err, order){
     if (err) return next(err);
     res.send(order);
   });
});



module.exports = router;
