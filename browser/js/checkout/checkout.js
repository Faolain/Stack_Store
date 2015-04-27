'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('checkout', {
        url: '/checkout',
        controller: "ShoppingCartController",
        templateUrl: 'js/checkout/checkout.html'
    });
});