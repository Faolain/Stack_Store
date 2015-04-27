'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('details', {
        url: '/animal/:animalID',
        controller: "AnimalDetailsController",
        templateUrl: 'js/animalDetails/animalDetails.html'
    });
});

app.controller('AnimalDetailsController', function ($scope, $stateParams, AuthService, AnimalsFactory) {

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
	}

});