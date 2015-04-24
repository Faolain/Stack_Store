app.controller('PetStoreFrontController', function ($scope, $stateParams, PetStoreFrontFactory) {

	PetStoreFrontFactory.getPets( /*$stateParams.category*/ ).then(function(pets){
		$scope.pets = pets;
	});

	PetStoreFrontFactory.getPetByID( $stateParams.animalID ).then(function(pet){
		$scope.pet = pet;
	});

	PetStoreFrontFactory.createReview( $stateParams.animalID ).then(function(pet){

		$scope.pet = pet;
	});

});