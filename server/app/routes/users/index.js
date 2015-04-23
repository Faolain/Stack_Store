var router = require('express').Router();
var mongoose = require('mongoose');
var Users = require('../../../db/models/user.js');
var bluebird = require('bluebird');

var ensureAdmin = function (req, res, next) {
   if (req.user.admin) {
       next();
   } else {
       res.status(403).end();
   }
};

//Update a Particular User Password
router.put('/changeUserPassword/:id', ensureAdmin, function (req, res, next) {

    Users.findById(req.params.id, function (err, user){
      user.password = req.body.password;
      user.save(function(err, savedUser){
         if (err) return next(err);
         res.send(savedUser);
      });
    });
});

//Get all the orders for Admin
router.get('/', ensureAdmin, function (req, res, next) {
  Users.find({}, function(err, users) {
    res.send(users);
  });
});

//Ability to Make a user an Admin
router.put('/promoteUser/:id', ensureAdmin, function (req, res, next) {

    Users.findById(req.params.id, function (err, user){
      user.admin = true;
      user.save(function(err, savedUser){
         if (err) return next(err);
         res.send(savedUser);
      });
    });
});

module.exports = router;