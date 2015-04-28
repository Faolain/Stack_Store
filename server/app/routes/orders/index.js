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
      // User.addOrderToUser(req.user.id, order.id, function(err,userWithOrder){
      //   if(err) return next(err);
      //   console.log('successfully added order to user');
      //   if(!userWithOrder){return next(err);}
      //   else
      //   res.send(userWithOrder);    
      // });
      console.log("sucessfully saved order",order);
      res.send(order);    
  });
});


//Get all the orders for Admin
router.get('/', ensureAdmin, function (req, res) {
  //if it is an admin get all items
  var status =  req.body.status ?  {status:req.body.status} : {};
  if(req.user.admin){
      Order.find(status, function(err, orders) {
        res.send(orders);
      });

  }
  else{
    User.findById(req.session.passport.user, function(err, user){
      res.send(user.orders);

    });
  }

});


//Get Order Details
router.get('/:id', function (req, res) {
  var id = req.params.id;

  Order.findById(id, function (err, order){
    
    order.populate('itemList.item',function(err,orderPopulated){
        res.send(orderPopulated);
    });
  });
});



//Updating Status on Order
router.put('/:id', ensureAdmin, function (req, res, next) {
  var newStatus = req.body.status;
  Order.findById(req.params.id, function(err, order){
    order.status = newStatus;
    order.save(function(err,data){
       if (err) console.error(err);
       else if(order){
        console.log('sending back order',order);
        res.send(order);

       }

    });
   
     
   });
});

//deleting an order
router.delete('/:id', ensureAdmin, function(req,res,next){
    Order.findByIdAndRemove(req.params.id, function(err){
        return next(err);
    });
});


module.exports = router;
