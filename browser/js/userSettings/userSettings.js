app.config(function ($stateProvider) {

    $stateProvider.state('userSettings', {
        url: '/user-settings',
        templateUrl: 'js/userSettings/userSettings.html',
        controller: "UserSettingsController",
        // The following data.authenticate is read by an event listener
        // that controls access to this state. Refer to app.js.
        data: {
            authenticate: true
        }
    });

});

// app.factory('SecretStash', function ($http) {

//     var getStash = function () {
//         return $http.get('/api/members/secret-stash').then(function (response) {
//             return response.data;
//         });
//     };

//     return {
//         getStash: getStash
//     };

// });