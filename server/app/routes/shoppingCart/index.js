var router = require('express').Router();
var ShoppingCart = require('../../../db/models/shoppingCart.js');
var ShoppingCartItem = require('../../../db/models/shoppingCartItem.js');

module.exports = router;

//Get particular shopping cart
router.get('/:id', function (req, res) {
  var id = req.params.id;

  ShoppingCart.findById(id, function (err, cart){
    res.send(cart);
  });
});

//Get All Carts
router.get('/', function (req, res) {
  ShoppingCart.find({}, function(err, animals) {
    res.send(animals);
  });
});



