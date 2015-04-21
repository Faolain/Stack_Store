app.controller('PetStoreFrontController', function ($scope, $stateParams, PetStoreFrontFactory) {

	//console.log(FlashCardsFactory.getFlashCards());
	PetStoreFrontFactory.getPets( /*$stateParams.category*/ ).then(function(pets){
		$scope.pets = pets;
	});

});