var mongoose = require('mongoose');
var db = mongoose.connection;


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
});
mongoose.connect('mongodb://localhost/exotic-animal-store');

var eventSchema = mongoose.Schema({
    eventName: {type: String, require: true},
    eventInfo: String,
    AdditionalInfo: {},
    userInfo: {}
});

//removes excessive information from event user information
eventSchema.pre('save',function(next){
	delete this.userInfo.orders;
	delete this.userInfo.cart;
	next();
});


module.exports = mongoose.model('Event', eventSchema);

