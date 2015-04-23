var router = require('express').Router();
var mongoose = require('mongoose');
var Order = require('../../../db/models/order.js');

var ensureAdmin = function (req, res, next) {
   if (req.user.admin) {
       next();
   } else {
       res.status(403).end();
   }
};

//create Order
router.post('/', ensureAdmin, function(req,res,next){
    Order.create(req.body, function (err, order) {
    if (err) return next(err);
    // saved!
    res.send(order);
  });
});


//Get all the orders for Admin
router.get('/', function (req, res) {

  var obj = {};

  if(req.body.status) obj.status = req.body.status;

  Order.find(obj, function(err, orders) {
    res.send(orders);
  });
});

//Get Order Details
router.get('/:id', function (req, res) {
  var id = req.params.id;

  Order.findById(id, function (err, order){
    res.send(order);
  });
});



//Updating Status on Order
router.put('/:id', function (req, res, next) {

  Order.findByIdAndUpdate(req.params.id, req.body, function(err, order){
     if (err) return next(err);
     res.send(order);
   });
});

//deleting an order
router.delete('/:id', function(req,res,next){
    Order.findByIdAndRemove(req.params.id, function(err){
        return next(err);
    });
});


module.exports = router;
