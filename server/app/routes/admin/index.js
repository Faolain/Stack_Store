var router = require('express').Router();
var Animals = require('../../../db/models/animal.js');
var Orders = require('../../../db/models/order.js');
var Users = require('../../../db/models/user.js');
var mongoose = require('mongoose');
module.exports = router;

//==========Animal List ========================//

//Sends Array of Entire List of Animals
router.get('/getStock', function (req, res) {
  Animals.find({}, function(err, animals) {
    res.send(animals);
  });
});

//Creates Animal
router.post('/createAnimal', function (req, res, next) {
  Animals.create(req.body, function (err, animal) {
    if (err) return next(err);
    // saved!
    res.send(animal);
  });
});

//Edit Animal
router.put('/editAnimal/:id', function (req, res, next) {

  Animals.findByIdAndUpdate(req.params.id, req.body, function(err, animal){
     if (err) return next(err);
     res.send(animal);
   });
});

//================ORDERS========================//

//Get all the orders for Admin
router.get('/getAllOrders', function (req, res) {

  var obj = {};

  if(req.body.status) obj.status = req.body.status;

  Orders.find(obj, function(err, orders) {
    res.send(orders);
  });
});

//Get Order Details
router.get('/getOrderDetails/:id', function (req, res) {
  var id = req.params.id;

  Orders.findById(id, function (err, order){
    res.send(order);
  });
});

//Updating Status on Order
router.put('/changeStatus/:id', function (req, res, next) {

  Orders.findByIdAndUpdate(req.params.id, req.body, function(err, order){
     if (err) return next(err);
     res.send(order);
   });
});

//================USERS========================//

//Update a Particular User Password
router.put('/changeUserPassword/:id', function (req, res, next) {

    Users.findById(req.params.id, function (err, user){
      user.password = req.body.password;
      user.save(function(err, savedUser){
         if (err) return next(err);
         res.send(savedUser);
      });
    });
});

//Get all the orders for Admin
router.get('/getAllUsers', function (req, res, next) {
  Users.find({}, function(err, users) {
    res.send(users);
  });
});

//Ability to Make a user an Admin
router.put('/promoteUser/:id', function (req, res, next) {

    Users.findById(req.params.id, function (err, user){
      user.admin = true;
      user.save(function(err, savedUser){
         if (err) return next(err);
         res.send(savedUser);
      });
    });
});
