app.controller('PetStoreFrontController', function ($scope, $stateParams, AuthService, PetStoreFrontFactory) {   

	PetStoreFrontFactory.getPets( /*$stateParams.category*/ ).then(function(pets){
		$scope.pets = pets;
	});

});