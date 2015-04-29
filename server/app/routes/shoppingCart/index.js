var router = require('express').Router();
var mongoose = require('mongoose');
var ShoppingCart = require('../../../db/models/shoppingCart.js');
var User = require('../../../db/models/user.js');1



var ensureAdmin = function (req, res, next) {
   if (req.user.admin) {
       next();
   } else {
       res.status(403).end();
   }
};

//Create new cart
router.post('/', function(req,res){
	var newCart = new ShoppingCart({items: []});
	newCart.save(function(err,data){
		console.log("data",data);
		res.send(data);
	});

});


//Get All Carts
router.get('/', function (req, res) {
  ShoppingCart.find({}, function(err, cart) {
    res.send(cart);
  });
});

//Get particular shopping cart
router.get('/:id', ensureAdmin, function (req, res) {
  var id = req.params.id;
  ShoppingCart.findById(id, function (err, cart){
    res.send(cart);
  });
});

//Get Saved shopping cart for particular user
router.get('/getYourCart', ensureAdmin, function (req, res) {
  var id = req.params.id;
  ShoppingCart.findById(id, function (err, cart){
    res.send(cart);
  });
});

//update cart
router.put('/:cartId', function(req,res, next){
	//at this point we need to make sure that the shopping cart ID is added
	//to the user model

	var cartId = req.params.cartId;
	var petId = req.params.petId;
	var cartItems = req.body;
	var userId = req.user.id;
	User.addCartIdToUser(cartId, userId, function(err,data){
		if(err) console.err('error with adding cart ID',err);

	});

	ShoppingCart.updateShoppingCart(cartItems,cartId,function(err,data){
		if(err) console.err('error with update shopping cart',err);

	});


});

//Delete cart
router.delete('/:id', function(req,res){
	var id = req.params.id;
	ShoppingCart.remove({_id: id}, function(err,data){
		if(err) console.error(err);
		else if(data) res.send("DELETED!");
	});

});
module.exports = router;


