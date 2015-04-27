'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

var schema = new mongoose.Schema({
    email: {
      type: String,
      unique: true
    },
    password: {
        type: String
    },
    salt: {
        type: String
    },
    twitter: {
        id: String,
        username: String,
        token: String,
        tokenSecret: String
    },
    facebook: {
        id: String
    },
    google: {
        id: String
    },
    admin: {type: Boolean, default: false},
    cart: { type: mongoose.Schema.ObjectId, ref: 'ShoppingCart' },
    orders: [{type: mongoose.Schema.ObjectId, ref: 'Order'}]
});

// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
var generateSalt = function () {
    return crypto.randomBytes(16).toString('base64');
};

var encryptPassword = function (plainText, salt) {
    var hash = crypto.createHash('sha1');
    hash.update(plainText);
    hash.update(salt);
    return hash.digest('hex');
};

schema.pre('save', function (next) {

    if (this.isModified('password')) {
        this.salt = this.constructor.generateSalt();
        this.password = this.constructor.encryptPassword(this.password, this.salt);
    }

    next();

});

schema.static('addCartIdToUser', function(cartId,userId, callback){
    this.findById(userId, function(err,user){
        if(err) console.error('find user error',err);
        else if(user){
            user.cart = cartId;
            user.save(callback);
        }

    });
});
schema.static('addOrderToUser', function(userId, orderId, callback){
    this.findById(userId, function(err,user){
        if(err) console.error('find user error',err);
        else if(user){
            console.log('pushing order to user orders');
            user.orders.push(orderId);
            user.save(callback);
        }

    });
});

schema.method('populateCart', function(callback){
    this.deepPopulate('cart.items.item',function(err,user){
        if(err) console.log('populate cart error',err);
        else if(user){
            callback(user);
           
        }
    });
});

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};
schema.plugin(deepPopulate);

schema.path('email').validate(validateEmail, "The email must be valid");

schema.statics.generateSalt = generateSalt;
schema.statics.encryptPassword = encryptPassword;

schema.method('correctPassword', function (candidatePassword) {
    return encryptPassword(candidatePassword, this.salt) === this.password;
});

module.exports = mongoose.model('User', schema);