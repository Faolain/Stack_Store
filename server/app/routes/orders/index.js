var router = require('express').Router();
var mongoose = require('mongoose');
var Order = require('../../../db/models/order.js');
var User = require('../../../db/models/user.js');

var ensureAdmin = function (req, res, next) {
   if (req.user.admin) {
       next();
   } else {
       res.status(403).end();
   }
};
var ensureAuthenticated = function (req, res, next) {
   if (req.isAuthenticated()) {
       next();
   } else {
       res.status(401).end();
   }
};


//create Order
router.post('/', ensureAuthenticated, function(req,res,next){
    Order.create(req.body, function (err, order) {
    if (err) return next(err);
    // saved!
    res.send(order);
  });
});


//Get all the orders for Admin
router.get('/', function (req, res) {
  //if it is an admin get all items
  if(req.user.admin){
      Order.find({status: req.body.status}, function(err, orders) {
        res.send(orders);
      });

  }
  User.findById(req.session.passport.user, function(err, user){
    res.send(user.orders);

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
router.put('/:id', ensureAdmin, function (req, res, next) {

  Order.findByIdAndUpdate(req.params.id, req.body, function(err, order){
     if (err) return next(err);
     res.send(order);
   });
});

//deleting an order
router.delete('/:id', ensureAdmin, function(req,res,next){
    Order.findByIdAndRemove(req.params.id, function(err){
        return next(err);
    });
});


module.exports = router;
