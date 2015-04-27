'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('admin', {
        url: '/admin',
        controller: "AdminController",
        templateUrl: 'js/admin/admin.html',
        data: {
            admin: true
        }
    });
});

app.controller('AdminController', function ($scope, $stateParams, AuthService, AnimalsFactory) {

	$scope.isAdmin = function () {
        return AuthService.isAuthenticated();
    };
       

	AnimalsFactory.getAnimalByID( $stateParams.animalID ).then(function(pet){
		$scope.pet = pet;
	});

	$scope.sendReview = function( review ) {
		AnimalsFactory.createReview( review.content, $stateParams.animalID )
		.then( function (review)
			{
				$scope.pet.reviews.push(review);
			});
	}

});