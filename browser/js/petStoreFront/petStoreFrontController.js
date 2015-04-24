app.controller('PetStoreFrontController', function ($scope, $stateParams, AuthService, PetStoreFrontFactory) {

	$scope.isLoggedIn = function () {
                  return AuthService.isAuthenticated();
              };

    $scope.newReview = {
        content: ""
    };         

	PetStoreFrontFactory.getPets( /*$stateParams.category*/ ).then(function(pets){
		$scope.pets = pets;
	});

	PetStoreFrontFactory.getPetByID( $stateParams.animalID ).then(function(pet){
		$scope.pet = pet;
	});

	$scope.sendReview = function( review ) {
		PetStoreFrontFactory.createReview( review.content, $stateParams.animalID )
		.then( function (review)
			{
				$scope.pet.reviews.push(review);
			});
	}

});