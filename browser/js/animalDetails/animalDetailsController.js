
app.controller('AnimalDetailsController', function ($scope, $stateParams, $state, AuthService, AnimalsFactory,ShoppingCart) {
    $scope.newReview = {
        content: ""
    };         

	AnimalsFactory.getAnimalByID( $stateParams.animalID ).then(function(pet){
		$scope.pet = pet;
	});

	//SCOPE METHODS

	$scope.isLoggedIn = function () {
                  return AuthService.isAuthenticated();
              };

	$scope.sendReview = function( review ) {
		AnimalsFactory.createReview( review.content, $stateParams.animalID )
		.then( function (review)
			{
				$scope.pet.reviews.push(review);
			});
	};
	$scope.addToCart = function(pet){
		ShoppingCart.addToCart(pet);
		$state.go($state.current, {}, {reload: true});
		

	};

});