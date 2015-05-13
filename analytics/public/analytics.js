app.factory('AnalyticsFactory',function($http,AuthService){

	//constructor function for analytics 'event'
	function Event(eventName, eventInfo, additionalInfo, userInfo){
		this.eventName = eventName;
		this.eventInfo = eventInfo;
		this.additionalInfo = additionalInfo;
		this.userInfo = userInfo;

	}
	return {
		saveEvent: function(eventName, eventInfo, additionalInfo){
			//check if user is logged in and if so, add user obect to analytics event
			return AuthService.getLoggedInUser()
				.then(function(user){
					return user;
				})
				.then(function(user){
					var eventObj = new Event(eventName,eventInfo, additionalInfo, user);
						return $http.post('http://localhost:1338/ping',eventObj);
				});		
		}
	};

});

//directive is included in html body to enable on event analytics reporting
app.directive('analytics', function (AnalyticsFactory) {
  return {
  	restrict: 'A',

  	//link typically used instead of controller for registering dom listeners
  	//executed after templates have been compiled
    link: function (scope, element, attrs) {
   	  // on button click listening
      // Get a reference to the button element
      var domButtons = document.querySelectorAll('button');
      // // Wrap it as a jqLite element
      var buttons = angular.element(domButtons);
      buttons.on('click', AnalyticsFactory.saveEvent('button_click'));

      //on link click listening
      var domLinks = document.querySelectorAll('a');
      var links = angular.element(domLinks);
      links.on('click', AnalyticsFactory.saveEvent('link_click'));

    }

  };
});


app.run(function($rootScope, AnalyticsFactory){

	//stateChangeStart event is fired by ui-router whenever state changes
	$rootScope.$on('$stateChangeStart', 
	function(event, toState, toParams, fromState, fromParams){ 

		//for all state changes trigger a page_view event
		AnalyticsFactory.saveEvent('page_view')
		.catch(function(err){
			console.error('there was a problem sending page_view event',err);
		});

		//if the user is looking at the home page
		if(toState.url ==='/'){
			AnalyticsFactory.saveEvent('view_home')
			.catch(function(err){
				console.error('there was a problem saving home event',err);
			});
		}
		//if the user is looking at a specific animal,
		if(toState.url ==='/animal/:animalID'){		
			AnalyticsFactory.saveEvent('view_animal',toParams.animalID)
			.catch(function(err){
				console.error('problem sending view_animal event',err);
			});

		}
		//if the user is looking at the user settings page
		if(toState.url ==='/user-settings'){
			AnalyticsFactory.saveEvent('view_settings')
			.catch(function(err){
				console.error('problem sending user_settings event',err);
			});

		}
	    
	});
	 	
});



