'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    discount: {type: Number, required: true},
    discontinued: {type: Boolean, default: false },
    validCategories: [String],
    createdDate: Date,
    expirationDate: Date
});

// schema.static('applyPromoCode', function(cartID, promoCode){
//   cartItems = cartItems.map(function(item){
//     return {item: item._id, quantity: item.quantity,price:item.price};
//   });
//   this.findById(cartId,function(err,cart){
//     if(err) console.error('find cart error',err);
//     else if(cart){
//       cart.items = cartItems;
//       cart.save(callback);
//     }
//   });
// });


module.exports = mongoose.model('Promo', schema);