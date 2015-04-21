app.factory('ShoppingCart', function($http, localStorageService) {
  var ShoppingCart = {
      addToCart: function(pet){
        var existingPet = localStorageService.get(pet.name);
        if(!existingPet) {
          pet.quantity = 1;
          
          localStorageService.set(pet.name, pet);}
        else{
          existingPet.quantity++;
          localStorageService.set(existingPet.name, existingPet);
        }

      },
      retrievePetFromCart :function(pet){
        localStorageService.get(pet.name);
      },
      getCart :function(){
        var petNames = localStorageService.keys();
        var cartArr = [];
        petNames.forEach(function(petName){
          cartArr.push(localStorageService.get(petName));
        });
       return cartArr;

      },

      clearCart :function(){
        localStorageService.clearAll();
      },
      removeFromCart: function(pet){
        localStorageService.remove(pet.name);
      },
      updateQuantity: function(pet, quant){

        var updatedPet = localStorageService.get(pet.name);

        updatedPet.quantity = quant;
        localStorageService.set(updatedPet.name,updatedPet);


      }


  };
  return ShoppingCart;
});
