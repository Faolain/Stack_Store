app.factory("UserSettingsFactory",function($http){
	//the user settings factory needs to comunicate with the server
	//and retrieve all necessary information for user settings page
	return {
		getUserInformation: function(){
			return $http.get('/api/users/userInformation').then(function(data){
				return data.data;
			});

		},
		changeUserPassword: function(){
			return $http.put('/api/users/changeYourPassword');
		},
		changeUserEmail: function(){
			return $http.put('/api/users/changeYourEmail');
		}

	};
});