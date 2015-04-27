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
router.put('/:id/changeUserPassword', ensureAdmin, function (req, res, next) {

    Users.findById(req.params.id, function (err, user){
      user.password = req.body.password;
      user.save(function(err, savedUser){
         if (err)  { 
            console.log(err);
            return next(err);
          }
         res.send(savedUser);
      });
    });
});

//get all users
router.get('/',  function (req, res, next) {
  Users.find({}, function(err, users) {
    if (err)  { 
        console.log(err);
        return next(err);
      }
    res.send(users);
  });
});

//Ability to Make a user an Admin
router.put('/:id/promoteUser', ensureAdmin, function (req, res, next) {

    Users.findById(req.params.id, function (err, user){
      if (err)  { 
        console.log(err);
        return next(err);
      }
      
      user.admin = true;
      user.save(function(err, savedUser){
         if (err)  { 
        console.log(err);
        return next(err);
      }
         res.send(savedUser);
      });
    });
});

module.exports = router;