app.controller('UserSettingsController',function($scope,  UserSettingsFactory, ShoppingCart){
	// the user settings controller needs to manage information about
	// users from database

	$scope.userInformation = {};
	$scope.cartItems = [];
	UserSettingsFactory.getUserInformation()
	.then(function(userInfo){
		//we need to determine a way to populate item IDs.
		//this could be done with a simple Get to the item API, but
		//i am thinking perhaps Deep Populate would be more elegant?
		$scope.userInformation = userInfo;
		$scope.cartItems = userInfo.cart.items;
	});



});