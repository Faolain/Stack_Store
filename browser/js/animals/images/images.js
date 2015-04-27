'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('images', {
        url: '/animal/:animalID/images',
        controller: "ImagesController",
        templateUrl: 'js/animals/images/images.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('ImagesController', function ($scope, $stateParams, AnimalsFactory) {

	AnimalsFactory.getAnimalByID( $stateParams.animalID ).then(function(pet){
		$scope.pet = pet;
	});

	//SCOPE METHODS
	$scope.addImage = function() {

		if ($scope.pet.newImage && $scope.pet.newImage !== "") {
			$scope.pet.secondaryImgUrls.push($scope.pet.newImage);
			$scope.pet.newImage = undefined;
			AnimalsFactory.updateAnimal(
				{ 	_id: $scope.pet._id,
					secondaryImgUrls: $scope.pet.secondaryImgUrls}
			);
		// We have to do this instead of update the whole body to avoid a cast error for the "reviews" Path
		}	
	}

	$scope.updateImage = function() {

		AnimalsFactory.updateAnimal(
			{ 	_id: $scope.pet._id,
				imgUrl: $scope.pet.imgUrl
			}
		);	
	}

	$scope.deleteImage = function( index ) {

		$scope.pet.secondaryImgUrls.splice( index, 1);
		AnimalsFactory.updateAnimal(
			{ 	_id: $scope.pet._id,
				secondaryImgUrls: $scope.pet.secondaryImgUrls}
		);
	}
	
});