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


var ensureAuthenticated = function (req, res, next) {
   if (req.isAuthenticated()) {
       next();
   } else {
       res.status(401).end();
   }
};
//Update a Particular User Password
router.put('/:id/changeUserPassword', ensureAdmin, function (req, res, next) {
    
    Users.findById(req.params.id, function (err, user){
     user.password = req.body.password;
      user.save(function(err, savedUser){
         if (err) return next(err);
         res.send(savedUser);
      });
    });
});
router.put('/changeYourPassword/', ensureAuthenticated, function (req, res, next) {
    //console.log(req.body);
    Users.findById(req.user.id, function (err, user){
     user.password = req.body.password;
     //req.body is empty - had anyone tested this?
     //console.log('req',req.body);
      user.save(function(err, savedUser){
         if (err) return next(err);
         res.send(savedUser);
      });
    });
});


router.put('/changeOwnEmail/', ensureAuthenticated, function (req, res, next) {
    Users.findById(req.user.id, function (err, user){

      user.email = req.body.email;
      //req.body is empty
      //console.log('req',req.body);
      user.save(function(err, savedUser){
         if (err)  { 
          console.log(err);
            return next(err);
          }
         res.send(savedUser);
      });
    });
});


//Update a Particular User email address
router.put('/:id/changeUserEmail/', ensureAuthenticated, function (req, res, next) {
    Users.findById(req.params.id, function (err, user){

      user.email = req.body.email;
      //req.body is empty
      //console.log('req',req.body);
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
router.get('/', ensureAdmin, function (req, res, next) {
  Users.find({}, function(err, users) {
    if (err)  { 
        console.log(err);
        return next(err);
      }
    res.send(users);
  });
});

//get specific user information
router.get('/userInformation', ensureAuthenticated, function (req, res, next) {

  Users.findById(req.user.id, function(err, user) {
    // if there is a user cart then populate it
    if(user.cart){
      user.populateCart(function(err, cart){
        res.send(user);
      });
    }
    else
      res.send(user);
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