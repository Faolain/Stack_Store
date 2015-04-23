var router = require('express').Router();
var mongoose = require('mongoose');
var ShoppingCart = require('../../../db/models/shoppingCart.js');
var ShoppingCartItem = require('../../../db/models/shoppingCartItem.js');
var bluebird = require('bluebird');
bluebird.promisifyAll(mongoose);

module.exports = router;

//Get All Carts
router.get('/', function (req, res) {
  ShoppingCart.find({}, function(err, cart) {
    res.send(cart);
  });
});

//Get particular shopping cart
router.get('/:id', function (req, res) {
  var id = req.params.id;
  ShoppingCart.findById(id, function (err, cart){
    res.send(cart);
  });
});

//Get All Carts
router.get('/', function (req, res) {
  ShoppingCart.find({}, function(err, cart) {
    res.send(cart);
  });
});

//Create new cart
router.post('/newCart', function(req,res){
	var newCart = new ShoppingCart({items: []});
	newCart.save(function(err,data){
		console.log("data",data);
		res.send(data);
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

//update cart
router.put('/updateCart/:cartId', function(req,res, next){
	console.log('hello');
	var cartId = req.params.cartId;
	var petId = req.params.petId;
	var cartItems = req.body;
	
	cartItems = cartItems.map(function(item){
		return {item: item._id.toString(), quantity: item.quantity,price:item.price};
	});

	ShoppingCart.findByIdAsync(cartId).then(function(cart){
		console.log('before',cart.items);
		cart.items = cartItems;
		console.log('after',cart.items);
		cart.saveAsync().then(function(cart){res.send(cart);
			}).catch(function(err){
				console.error('shopping cart error',err);
			});
	});
	
});


router.put('/removeItem/:id', function(req,res){
	var id = req.params.id;




});


//update cart item quantities
router.put('/updateCart', function(req,res){


});


	//move this into model as 'static' method.... 
	//update quantity method on shoppingCart Item... deal with in callbacks

	// ShoppingCartItem.findByIdAsync(itemId).then(function(item){
	// 	if(item)
	// 		console.log('EXISTING',item);
	// 	else {

	// 	}
	// });
	

	// console.log('itemId',itemId);
	// ShoppingCart.findByIdAndUpdate(cartId, {$push: {"items" : itemId}}, function(err,cart){
	// 	if(err) return next(err);
	// 	console.log('cart',cart);
	// 	res.send(cart);
	// });

// ShoppingCart.findOneAsync({_id:cartId}).then(function(cart){
	// 	var items = cart.items;
	// 	var found = false;
	// 	// for(var i =0;i<items.length;i++){
	// 	// 	//if the pet already exists in the shopping cart
	// 	// 	if(items[i]._id == petId){
	// 	// 		found = true;
	// 	// 		items[i].quantity++;
	// 	// 	}
	// 	// }
	// 	//if the item does not exist in the shopping cart
	// 	if(!found){
	// 		var newCartItem = new ShoppingCartItem({item: petId, quantity:1});
	// 		newCartItem.saveAsync()
	// 		.then(function(err,data){
	// 			console.log('err,data',err,data);
	// 		});
		

	// 		//we need to then update the shopping cart

	// 	}
		//if the item does not exist, we need to create new Shopping Cart Item and
		//add it to Shopping Cart
		// else{

		// }
		//if item in array update quantity otherwise add to array.




