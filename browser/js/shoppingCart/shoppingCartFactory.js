app.factory('ShoppingCart', function($http) {
  var Session = {
    data: {pets: []},
    addToCart: function(pet) 
    { this.data.pets.push(pet);
      console.log(this.data.pets);
    },
    updateCart: function() {

    }
  };
  return Session;
});