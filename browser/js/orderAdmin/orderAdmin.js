'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('orders', {
        url: '/orders',
        controller: "OrdersAdminController",
        templateUrl: 'js/orderAdmin/orderAdmin.html'

    });
});
