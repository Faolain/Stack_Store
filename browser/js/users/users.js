'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('users', {
        url: '/users',
        controller: "UsersController",
        templateUrl: 'js/users/users.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('UsersController', function ($scope, $stateParams, AuthService, AdminFactory) {

	if (!$scope.users) AdminFactory.getUsers().then(function(users){
		$scope.users = users;
	});

	$scope.data = {
        newPassword: "",
        showDisplay: false
    }; 

	//Why is it called each time I loop??? in the users.html

	//SCOPE METHODS
	$scope.promoteToAdmin = function( userPromoted ) {
		
		AdminFactory.promoteToAdmin( userPromoted._id )
		.then( function (user)
			{
				console.log("UPDATED!");
				userPromoted.admin = user.admin;
			});
	}

	$scope.changePassword = function( user, data ) {
		
		AdminFactory.changePassword( user._id, data.newPassword )
		.then( function (user)
			{
				$scope.data.showDisplay = false;
				$scope.data.newPassword = "";
			});
	}

});