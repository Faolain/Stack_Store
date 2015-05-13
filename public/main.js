'use strict';
var app = angular.module('exotic-animals', ['ui.router', 'fsaPreBuilt', 'LocalStorageModule']);

app.config(function ($urlRouterProvider, $locationProvider, localStorageServiceProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
    localStorageServiceProvider.setPrefix('exotic-animals');
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state) {

    // The given state requires an authenticated user.
    var destinationStateRequiresAuth = function destinationStateRequiresAuth(state) {
        return state.data && state.data.authenticate;
    };

    var destinationStateRequiresAdmin = function destinationStateRequiresAdmin(state) {
        return state.data && state.data.admin;
    };

    // $stateChangeStart is an event fired
    // whenever the process of changing a state begins.
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

        if (destinationStateRequiresAdmin(toState) && !AuthService.isAdmin()) {
            event.preventDefault();
        }

        if (!destinationStateRequiresAuth(toState)) {
            // The destination state does not require authentication
            // Short circuit with return.
            return;
        }

        if (AuthService.isAuthenticated()) {
            // The user is authenticated.
            // Short circuit with return.
            return;
        }

        // Cancel navigating to new state.
        event.preventDefault();

        AuthService.getLoggedInUser().then(function (user) {
            // If a user is retrieved, then renavigate to the destination
            // (the second time, AuthService.isAuthenticated() will work)
            // otherwise, if no user is logged in, go to "login" state.
            if (user) {
                $state.go(toState.name, toParams);
            } else {
                $state.go('login');
            }
        });
    });
});
'use strict';
app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('about', {
        url: '/about',
        controller: 'AboutController',
        templateUrl: 'js/about/about.html'
    });
});

app.controller('AboutController', function ($scope) {

    // Images of beautiful Fullstack people.
    $scope.images = ['https://pbs.twimg.com/media/B7gBXulCAAAXQcE.jpg:large', 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10862451_10205622990359241_8027168843312841137_o.jpg', 'https://pbs.twimg.com/media/B-LKUshIgAEy9SK.jpg', 'https://pbs.twimg.com/media/B79-X7oCMAAkw7y.jpg', 'https://pbs.twimg.com/media/B-Uj9COIIAIFAh0.jpg:large', 'https://pbs.twimg.com/media/B6yIyFiCEAAql12.jpg:large'];
});

app.factory('AdminFactory', function ($http) {

    return {

        getUsers: function getUsers() {

            return $http.get('/api/users').then(function (response) {
                //console.log(response.data);
                return response.data;
            });
        },
        changePassword: function changePassword(id, new_Password) {

            return $http.put('/api/users/' + id + '/changeUserPassword', { password: new_Password }).then(function (response) {
                return response.data;
            });
        },
        promoteToAdmin: function promoteToAdmin(id) {

            return $http.put('/api/users/' + id + '/promoteUser').then(function (response) {
                return response.data;
            });
        },
        getCategories: function getCategories() {

            return $http.get('/api/categories').then(function (response) {
                return response.data;
            });
        },
        createCategory: function createCategory(category) {

            return $http.post('/api/categories', category).then(function (response) {
                return response.data;
            });
        },
        deleteCategory: function deleteCategory(category) {

            return $http['delete']('/api/categories/' + category._id).then(function (response) {
                return response.data;
            });
        },
        updateCategory: function updateCategory(category) {

            return $http.put('/api/categories/' + category._id, category).then(function (response) {
                return response.data;
            });
        }

    };
});
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('admin', {
        url: '/admin',
        controller: 'AdminController',
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

    AnimalsFactory.getAnimalByID($stateParams.animalID).then(function (pet) {
        $scope.pet = pet;
    });

    $scope.sendReview = function (review) {
        AnimalsFactory.createReview(review.content, $stateParams.animalID).then(function (review) {
            $scope.pet.reviews.push(review);
        });
    };
});
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('details', {
        url: '/animal/:animalID',
        controller: 'AnimalDetailsController',
        templateUrl: 'js/animalDetails/animalDetails.html'
    });
});

app.controller('AnimalDetailsController', function ($scope, $stateParams, $state, AuthService, AnimalsFactory, ShoppingCart) {
    $scope.newReview = {
        content: ''
    };

    AnimalsFactory.getAnimalByID($stateParams.animalID).then(function (pet) {
        $scope.pet = pet;
    });

    //SCOPE METHODS

    $scope.isLoggedIn = function () {
        return AuthService.isAuthenticated();
    };

    $scope.sendReview = function (review) {
        AnimalsFactory.createReview(review.content, $stateParams.animalID).then(function (review) {
            $scope.pet.reviews.push(review);
        });
    };
    $scope.addToCart = function (pet) {
        ShoppingCart.addToCart(pet);
        $state.go($state.current, {}, { reload: true });
    };
});
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('animal_categories', {
        url: '/animal/:animalID/categories',
        controller: 'AnimalCategoriesController',
        templateUrl: 'js/animal_categories/animal_categories.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('AnimalCategoriesController', function ($scope, $stateParams, AnimalsFactory, AdminFactory) {

    if (!$scope.animal_categories) AnimalsFactory.getAnimalByID($stateParams.animalID).then(function (animal) {

        $scope.animal_categories = animal.categories;

        AdminFactory.getCategories().then(function (categories) {

            $scope.categories = categories;

            for (var i = 0; i < $scope.categories.length; i++) {

                $scope.categories[i].matches = [];
                for (var j = 0; j < $scope.categories[i].values.length; j++) {
                    $scope.categories[i].matches.push(false);
                }

                for (var k = 0; k < $scope.categories[i].values.length; k++) {

                    if ($scope.animal_categories.indexOf($scope.categories[i].values[k]) >= 0) $scope.categories[i].matches[k] = true;
                }
            }
        });
    });

    //SCOPE METHODS
    $scope.updateCategories = function () {

        var newCategories = [];

        for (var i = 0; i < $scope.categories.length; i++) {

            for (var j = 0; j < $scope.categories[i].values.length; j++) {

                if ($scope.categories[i].matches[j]) {

                    newCategories.push($scope.categories[i].values[j]);
                }
            }
        }

        console.log(newCategories);

        AnimalsFactory.updateAnimal({ _id: $stateParams.animalID, categories: newCategories }).then(function (animal) {
            console.log('UPDATED!');
        });
    };
});
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('animals', {
        url: '/animals',
        controller: 'AnimalsController',
        templateUrl: 'js/animals/animals.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('AnimalsController', function ($scope, $stateParams, AnimalsFactory) {

    if (!$scope.animals) AnimalsFactory.getAllAnimals().then(function (animals) {
        $scope.animals = animals;
    });

    $scope.data = {
        newName: '',
        newDescription: '',
        newPrice: '',
        newStock: '',
        createAnimal: false
    };

    // //SCOPE METHODS

    $scope.createNewAnimal = function (data) {

        var newAnimal = {
            name: data.newName,
            description: data.newDescription,
            price: data.newPrice,
            stock: data.newStock
        };

        AnimalsFactory.createAnimal(newAnimal).then(function (animal) {
            console.log('ADDED!');
            $scope.animals.push(animal);
            $scope.data.createAnimal = false;

            $scope.data.newName = '';
            $scope.data.newDescription = '';
            $scope.data.newPrice = '';
            $scope.data.newStock = '';
        });
    };

    $scope.updateAnimal = function (animal) {

        animal.beingEdited = undefined;

        AnimalsFactory.updateAnimal(animal).then(function (animal) {
            console.log('UPDATED!');
        });
    };

    $scope.edit = function (animal) {
        animal.beingEdited = true;
        animal.oldName = animal.name;
        animal.oldDesc = animal.description;
        animal.oldPrice = animal.price;
        animal.oldStock = animal.stock;
    };

    $scope.reset = function (animal) {
        animal.beingEdited = false;
        animal.name = animal.oldName;
        animal.description = animal.oldDesc;
        animal.price = animal.oldPrice;
        animal.stock = animal.oldStock;
        animal.oldName = undefined;
        animal.oldDesc = undefined;
        animal.oldPrice = undefined;
        animal.oldStock = undefined;
    };
});
app.factory('AnimalsFactory', function ($http) {

    return {
        getAllAnimals: function getAllAnimals(searchText) {

            var queryParams = {};

            if (searchText) {
                queryParams.search = searchText;
            }

            return $http.get('/api/animals', {
                params: queryParams
            }).then(function (response) {
                return response.data;
            });
        },

        getAnimalByID: function getAnimalByID(id) {

            return $http.get('/api/animals/' + id).then(function (response) {
                return response.data;
            });
        },

        createAnimal: function createAnimal(animal) {

            return $http.post('/api/animals', animal).then(function (response) {
                return response.data;
            });
        },

        updateAnimal: function updateAnimal(animal) {

            return $http.put('/api/animals/' + animal._id, animal).then(function (response) {
                return response.data;
            });
        },

        createReview: function createReview(content, id) {

            return $http.post('/api/animals/' + id + '/addReview', { content: content }).then(function (response) {
                return response.data;
            });
        }
    };
});
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('categories', {
        url: '/categories',
        controller: 'CategoriesController',
        templateUrl: 'js/categories/categories.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('CategoriesController', function ($scope, $stateParams, AuthService, AdminFactory) {

    if (!$scope.categories) AdminFactory.getCategories().then(function (categories) {
        $scope.categories = categories;
    });

    $scope.data = {
        newName: '',
        newValues: '',
        createCategory: false
    };

    //SCOPE METHODS
    $scope.createNewCategory = function (data) {

        var newCategory = {
            name: data.newName,
            values: data.newValues.split(/[\n,]+/).map(Function.prototype.call, String.prototype.trim)
            //TODO: if two of the values are equal it fails
        };

        AdminFactory.createCategory(newCategory).then(function (category) {
            $scope.categories.push(category);
            $scope.data.createCategory = false;
            $scope.data.newName = '';
            $scope.data.newValues = '';
        });
    };

    $scope.updateCategory = function (category) {

        category.beingEdited = undefined;
        category.values = category.newEditValues.split(/[\n,]+/).map(Function.prototype.call, String.prototype.trim);
        category.newEditValues = undefined;

        AdminFactory.updateCategory(category).then(function (category) {
            console.log('UPDATED!');
        });
    };

    $scope.deleteCategory = function (index) {

        AdminFactory.deleteCategory($scope.categories[index]).then(function (category) {
            $scope.categories.splice(index, 1);
        });
    };

    $scope.editCategory = function (category) {
        category.beingEdited = true;
        category.newEditValues = category.values.join();
        category.oldName = category.name;
        category.oldValues = category.values;
    };

    $scope.resetCategory = function (category) {
        category.beingEdited = false;
        category.name = category.oldName;
        category.values = category.oldValues;
        category.oldName = undefined;
        category.oldValues = undefined;
    };
});
app.directive('cartItems', function () {
    return {
        templateUrl: '/js/checkout/cartItem.tmpl.html',
        restrict: 'E',
        scope: {
            item: '='
        }
    };
});
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('checkout', {
        url: '/checkout',
        controller: 'ShoppingCartController',
        templateUrl: 'js/checkout/checkout.html'
    });
});
(function () {

    'use strict';

    // Hope you didn't forget Angular! Duh-doy.
    if (!window.angular) throw new Error('I can\'t find Angular!');

    var app = angular.module('fsaPreBuilt', []);

    app.factory('Socket', function ($location) {

        if (!window.io) throw new Error('socket.io not found!');

        var socket;

        if ($location.$$port) {
            socket = io('http://localhost:1337');
        } else {
            socket = io('/');
        }

        return socket;
    });

    // AUTH_EVENTS is used throughout our app to
    // broadcast and listen from and to the $rootScope
    // for important events about authentication flow.
    app.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });

    app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        var statusDict = {
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
        };
        return {
            responseError: function responseError(response) {
                $rootScope.$broadcast(statusDict[response.status], response);
                return $q.reject(response);
            }
        };
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push(['$injector', function ($injector) {
            return $injector.get('AuthInterceptor');
        }]);
    });

    app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

        // Uses the session factory to see if an
        // authenticated user is currently registered.
        this.isAuthenticated = function () {
            return !!Session.user;
        };

        this.isAdmin = function () {
            return !!Session.user && Session.user.admin;
        }; //added by Miguel to check if the user is an Admin user

        this.getLoggedInUser = function () {

            // If an authenticated session exists, we
            // return the user attached to that session
            // with a promise. This ensures that we can
            // always interface with this method asynchronously.
            if (this.isAuthenticated()) {
                return $q.when(Session.user);
            }

            // Make request GET /session.
            // If it returns a user, call onSuccessfulLogin with the response.
            // If it returns a 401 response, we catch it and instead resolve to null.
            return $http.get('/session').then(onSuccessfulLogin)['catch'](function () {
                return null;
            });
        };

        this.login = function (credentials) {
            return $http.post('/login', credentials).then(onSuccessfulLogin)['catch'](function (response) {
                return $q.reject({ message: 'Invalid login credentials.' });
            });
        };

        this.logout = function () {
            return $http.get('/logout').then(function () {
                Session.destroy();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            });
        };

        this.signUp = function (registerInfo) {
            return $http.post('/register', registerInfo).then(onSuccessfulLogin)['catch'](function (response) {
                console.log('ERROR at fsa-pre-built', response);
                return $q.reject({ message: 'Invalid signUp credentials.' });
            });
        }; //added by us

        function onSuccessfulLogin(response) {
            var data = response.data;
            Session.create(data.id, data.user);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            return data.user;
        }
    });

    app.service('Session', function ($rootScope, AUTH_EVENTS) {

        var self = this;

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
            self.destroy();
        });

        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
            self.destroy();
        });

        this.id = null;
        this.user = null;
        //add admin property - this can be checked with other service.
        this.create = function (sessionId, user) {
            this.id = sessionId;
            this.user = user;
        };

        this.destroy = function () {
            this.id = null;
            this.user = null;
        };
    });
})();
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        controller: 'HomePageController',
        templateUrl: 'js/home/home.html'
    });
});

app.filter('categoryFilter', function () {
    function intersect(a, b) {
        var t;
        if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
        return a.filter(function (e) {
            if (b.indexOf(e) !== -1) return true;
        });
    }

    return function (pets, categories) {
        var filtered = [];
        for (var i = 0; i < pets.length; i++) {
            var pet = pets[i];
            if (intersect(pet.categories, categories).length === categories.length) {
                filtered.push(pet);
            }
        }
        return filtered;
    };
});

app.controller('HomePageController', function ($scope, $stateParams, AdminFactory, AnimalsFactory) {
    $scope.filters = [];
    $scope.pets = [];
    $scope.searchField = { text: '' };

    if (!$scope.categories) AdminFactory.getCategories().then(function (categories) {
        $scope.categories = categories;

        for (var i = 0; i < $scope.categories.length; i++) {
            $scope.categories[i].matches = [];
            for (var z = 0; z < $scope.categories[i].values.length; z++) {
                $scope.categories[i].matches.push(false);
            }
        }
    });

    AnimalsFactory.getAllAnimals().then(function (pets) {
        $scope.pets = pets;
    });

    //SCOPE METHODS
    $scope.filter = function () {

        $scope.filters = [];

        for (var i = 0; i < $scope.categories.length; i++) {

            for (var j = 0; j < $scope.categories[i].values.length; j++) {
                if ($scope.categories[i].matches[j]) {
                    $scope.filters.push($scope.categories[i].values[j]);
                }
            }
        }
    };

    $scope.searchBy = function () {

        if (!$scope.searchField.text || $scope.searchField.text === '') AnimalsFactory.getAllAnimals().then(function (pets) {
            $scope.pets = pets;
        });else AnimalsFactory.getAllAnimals($scope.searchField.text).then(function (pets) {
            $scope.pets = pets;
        });
    };
});
app.controller('itemController', function ($scope, ShoppingCart, $rootScope) {
    $scope.shoppingCart = ShoppingCart;
    $scope.addToCart = function (pet) {
        ShoppingCart.addToCart(pet);
        $rootScope.$broadcast('updatedShoppingCart');
    };
    $scope.removeFromCart = function (pet) {
        ShoppingCart.removeFromCart(pet);
        $rootScope.$broadcast('updatedShoppingCart');
    };
});
app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });
});

app.controller('LoginCtrl', function ($scope, AuthService, $state) {

    $scope.login = {};
    $scope.error = null;

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo).then(function () {
            $state.go('home');
        })['catch'](function () {
            $scope.error = 'Invalid login credentials.';
        });
    };
});
app.directive('orderTableRow', function () {
    return {
        templateUrl: 'js/orderAdmin/OrderAdminTableRow.tmp.html',
        restrict: 'EA',
        scope: { order: '=' }
    };
});

'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('orders', {
        url: '/orders',
        controller: 'OrdersAdminController',
        templateUrl: 'js/orderAdmin/orderAdmin.html'

    });
});

app.controller('OrdersAdminController', function ($scope, $stateParams, OrdersAdminFactory) {
    $scope.orders;

    OrdersAdminFactory.getAllOrders().then(function (orders) {
        $scope.orders = orders;
    });

    $scope.editStatus = function (order, newStatus) {
        var orderId = order._id;
        OrdersAdminFactory.changeUserStatus(orderId, newStatus).then(function (data) {
            order.status = newStatus;
            console.log('we have successfully changed the status', data);
        })['catch'](function (err) {
            console.error('there was a problem', err);
        });
    };

    $scope.beingEdited = undefined;
});

app.controller('OrdersAdminController', function ($scope, $stateParams, OrdersAdminFactory) {
    $scope.orders;
    $scope.statuses = ['Created', 'Processing', 'Cancelled', 'Completed'];
    $scope.currentStatus;

    OrdersAdminFactory.getAllOrders().then(function (orders) {
        $scope.orders = orders;
    });
    $scope.filterByStatus = function (status) {
        $scope.currentStatus = status;
    };
    $scope.editStatus = function (order, newStatus) {
        var orderId = order._id;
        OrdersAdminFactory.changeUserStatus(orderId, newStatus).then(function (data) {
            order.status = newStatus;
        })['catch'](function (err) {
            console.error('there was a problem', err);
        });
    };

    $scope.beingEdited = undefined;
});
app.factory('OrdersAdminFactory', function ($http) {
    return {
        getAllOrders: function getAllOrders() {
            return $http.get('/api/orders').then(function (response) {
                return response.data;
            });
        },
        getOrderByID: function getOrderByID(id) {
            return $http.get('/api/orders/' + id).then(function (response) {
                return response.data;
            });
        },
        changeUserStatus: function changeUserStatus(orderId, newStatus) {

            return $http.put('/api/orders/' + orderId, { status: newStatus }).then(function (response) {
                return response.data;
            });
        }

    };
});
app.filter('orderStatusFilter', function () {
    return function (orders, currentStatus) {
        if (!currentStatus) return orders;
        if (orders) {
            orders = orders.filter(function (order) {
                if (order.status === currentStatus) return order;
            });
            return orders;
        }
    };
});
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('order_details', {
        url: '/order/:orderID',
        templateUrl: 'js/orderDetails/orderDetails.html'
    });
});

app.controller('OrderDetailsController', function ($scope, $stateParams, OrdersAdminFactory) {

    $scope.totalPrice = 0;

    OrdersAdminFactory.getOrderByID($stateParams.orderID).then(function (order) {
        $scope.order = order;
        order.itemList.forEach(function (elem) {
            $scope.totalPrice += elem.quantity * elem.price;
        });
    })['catch'](function (err) {
        console.error('there was an error with getting order', err);
    });
});
app.directive('orderDetails', function () {
    return {
        templateUrl: 'js/orderDetails/orderDetailsTemplate.html',
        restrict: 'E',
        controller: function controller($scope, $stateParams, OrdersAdminFactory) {

            OrdersAdminFactory.getOrderByID($stateParams.orderID).then(function (order) {
                $scope.order = order;
            })['catch'](function (err) {
                console.error('there was an error with getting order', err);
            });
        }
    };
});
app.directive('orderItems', function () {
    return {
        template: '<div class="row"><img class="checkout-img" src={{item.item.imgUrl}}></img><p>Item Description: {{item.item.name}}</p><p>Item Quantity:  {{item.quantity}}</p> Item Total: {{item.quantity*item.price}}</div>',
        restrict: 'E',
        scope: {
            item: '='
        }
    };
});
app.controller('orderController', function ($scope) {});
'use strict';
app.directive('orderForm', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/orders/orderForm.html',
        controller: function controller($scope, orderFactory, $state, $http) {

            $scope.promoError = '';

            $scope.promoApplication;

            $scope.applyPromo = function (promo) {
                return $http.get('/api/promos/' + promo).then(function (response) {
                    if (!response.data[0]) {
                        $scope.itemTotalDiscounted = '';
                        $scope.promoError = 'Sorry that promo is not valid';
                    } else {
                        var discountPercent = response.data[0].discount / 100;
                        $scope.itemTotalDiscounted = $scope.itemTotal - $scope.itemTotal * discountPercent;
                        $scope.promoError = '';
                        $scope.promoApplication = response.data[0]._id;
                    }
                });
            };

            $scope.getPromoId = function (promo) {
                return $http.get('/api/promos/' + promo).then(function (response) {
                    return response.data[0]._id;
                });
            };

            $scope.submitOrder = function (promo_name) {
                var order = {};
                order.status = 'Created';
                order.itemList = orderFactory.makeOrderItems($scope.items);
                order.billingAddress = $scope.billingAddress;
                order.promo = $scope.promoApplication;
                orderFactory.submitOrder(order).then(function (data) {

                    $state.go('home');
                })['catch'](function (err) {
                    console.error('problem with submitting order', err);
                });
            };
            $scope.billingAddress = {};
            $scope.billingAddress.firstName;
            $scope.billingAddress.lastName;
            $scope.billingAddress.Company;
            $scope.billingAddress.Address;
            $scope.billingAddress.Address2;
            $scope.billingAddress.City;
            $scope.billingAddress.ZIP;
            $scope.billingAddress.Country;
            $scope.billingAddress.State;
            $scope.billingAddress.Phone;
        }
    };
});

app.factory('orderFactory', function ($http) {
    return {
        submitOrder: function submitOrder(order) {
            return $http.post('/api/orders', order);
        },
        makeOrderItems: function makeOrderItems(items) {
            return items.map(function (item) {
                var newItem = {};
                newItem.item = item._id;
                newItem.quantity = item.quantity;
                newItem.price = item.price;
                return newItem;
            });
        },
        getPromoId: function getPromoId(order) {
            return $http.post('/api/orders', order);
        }
    };
});
app.factory('PromosFactory', function ($http) {
    return {
        getAllPromos: function getAllPromos() {
            return $http.get('/api/promos').then(function (response) {
                return response.data;
            });
        },

        createPromo: function createPromo(promo) {
            return $http.post('/api/promos', { promo: promo }).then(function (response) {
                return response.data;
            });
        },

        deletePromo: function deletePromo(promo) {
            return $http['delete']('/api/promos/' + promo._id).then(function (response) {
                return response.data;
            });
        }
    };
});
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('promos', {
        url: '/promos/:code',
        controller: 'PromosController',
        templateUrl: 'js/promos/promos.html'
    });
});

app.controller('PromosController', function ($scope, $stateParams, PromosFactory) {

    $scope.error = {};

    if (!$scope.promos) PromosFactory.getAllPromos().then(function (promos) {
        $scope.promos = promos;
    });

    $scope.createNewPromo = function (data) {

        var newPromo = {
            name: data.promoName,
            discount: data.promoDiscount,
            createdDate: new Date(),
            expirationDate: data.expirationDate,
            validCategories: data.validCategories.split(/[\n,]+/).map(Function.prototype.call, String.prototype.trim)
        };

        PromosFactory.createPromo(newPromo).then(function (promo) {
            $scope.promos.push(promo);
            $scope.data.createPromo = false;
            $scope.data.promoName = '';
            $scope.data.promoDiscount = '';
            $scope.data.expirationDate = '';
            $scope.data.validCategories = '';
        });
    };

    $scope.deletePromo = function (promo) {
        PromosFactory.deletePromo(promo).then(function (promos) {
            $scope.promos = promos;
        });
    };

    $scope.promoValidate = function (data) {};
});
app.config(function ($stateProvider) {

    $stateProvider.state('register', {
        url: '/register',
        templateUrl: 'js/register/register.html',
        controller: 'RegisterCtrl'
    });
});

app.controller('RegisterCtrl', function ($scope, AuthService, $state) {

    $scope.login = {};
    $scope.error = null;

    //SCOPE METHODS
    $scope.registerUser = function (registerInfo) {

        $scope.error = null;

        AuthService.signUp(registerInfo).then(function () {
            $state.go('home');
        })['catch'](function () {
            $scope.error = 'Invalid signUp credentials.';
        });
    };
});
app.controller('ShoppingCartController', function ($scope, $stateParams, $rootScope, ShoppingCart, $http) {

    $scope.items = [];
    $scope.itemQuantity;
    $scope.itemTotal = 0;
    $scope.itemTotalDiscounted = null;

    $scope.getTotal = function () {
        var items = ShoppingCart.getCart();
        items.forEach(function (element) {
            $scope.itemTotal += element.price * element.quantity;
        });
    };

    $scope.getDiscountedTotal = function () {
        var items = ShoppingCart.getCart();
        items.forEach(function (element) {
            $scope.itemTotal += element.price * element.quantity;
        });
    };

    $scope.getAllItems = function () {
        $scope.items = ShoppingCart.getCart();
        $scope.getTotal();
    };
    $rootScope.$on('updatedShoppingCart', function () {
        $scope.getTotal();
        $scope.getAllItems();
    });
    $scope.clearCart = function () {
        ShoppingCart.clearCart();
        $scope.getAllItems();
    };

    $scope.removeItem = function (pet) {

        ShoppingCart.removeFromCart(pet);
        $scope.getAllItems();
    };
    $scope.updateQuantity = function (item, quant) {
        ShoppingCart.updateQuantity(item, quant);
        $scope.getAllItems();
    };

    $scope.sendCartToDB = function () {
        $scope.getAllItems();
        //this needs to be updated to other cart

        $http.put('/api/cart/55391ca6891c507716024fd7', $scope.items).then(function (data) {
            console.log('sending data from front end', data);
        })['catch'](function (err) {
            console.error(err);
        });
    };

    $scope.getAllItems();
    if ($scope.items.length === 0) {
        ShoppingCart.retrieveFromDB();
    }
});
app.directive('shoppingCart', function () {
    return {
        restrict: 'E',
        controller: 'ShoppingCartController',
        templateUrl: 'js/shoppingCart/ShoppingCart.tmp.html'

    };
});
app.factory('ShoppingCart', function ($http, localStorageService) {
    var ShoppingCart = {
        addToCart: function addToCart(pet) {
            var existingPet = localStorageService.get(pet.name);
            if (!existingPet) {
                pet.quantity = 1;

                localStorageService.set(pet.name, pet);
            } else {
                existingPet.quantity++;
                localStorageService.set(existingPet.name, existingPet);
            }
        },
        retrievePetFromCart: function retrievePetFromCart(pet) {
            localStorageService.get(pet.name);
        },
        getCart: function getCart() {
            var petNames = localStorageService.keys();
            var cartArr = [];
            petNames.forEach(function (petName) {
                cartArr.push(localStorageService.get(petName));
            });
            return cartArr;
        },

        clearCart: function clearCart() {
            localStorageService.clearAll();
        },
        removeFromCart: function removeFromCart(pet) {
            localStorageService.remove(pet.name);
        },
        updateQuantity: function updateQuantity(pet, quant) {

            var updatedPet = localStorageService.get(pet.name);

            updatedPet.quantity = quant;
            localStorageService.set(updatedPet.name, updatedPet);
        },
        retrieveFromDB: function retrieveFromDB() {
            //will also need to have some mechanism to attach this to local storage.
            return $http.get('/api/cart/getYourCart');
        }

    };
    return ShoppingCart;
});

app.config(function ($stateProvider) {

    $stateProvider.state('userSettings', {
        url: '/user-settings',
        templateUrl: 'js/userSettings/userSettings.html',
        controller: 'UserSettingsController',
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
app.controller('UserSettingsController', function ($scope, UserSettingsFactory, ShoppingCart) {
    // the user settings controller needs to manage information about
    // users from database

    $scope.userInformation = {};
    $scope.cartItems = [];
    UserSettingsFactory.getUserInformation().then(function (userInfo) {
        //we need to determine a way to populate item IDs.
        //this could be done with a simple Get to the item API, but
        //i am thinking perhaps Deep Populate would be more elegant?
        $scope.userInformation = userInfo;
        $scope.cartItems = userInfo.cart.items;
        $scope.userId = userInfo.id;
    });
});
app.factory('UserSettingsFactory', function ($http) {
    //the user settings factory needs to comunicate with the server
    //and retrieve all necessary information for user settings page
    return {
        getUserInformation: function getUserInformation() {
            return $http.get('/api/users/userInformation').then(function (data) {
                return data.data;
            });
        },
        changeUserPassword: function changeUserPassword() {
            return $http.put('/api/users/changeYourPassword');
        },
        changeUserEmail: function changeUserEmail() {
            return $http.put('/api/users/changeYourEmail');
        }

    };
});
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('users', {
        url: '/users',
        controller: 'UsersController',
        templateUrl: 'js/users/users.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('UsersController', function ($scope, $stateParams, AuthService, AdminFactory) {

    if (!$scope.users) AdminFactory.getUsers().then(function (users) {
        $scope.users = users;
    });

    $scope.data = {
        newPassword: '',
        showDisplay: false
    };

    //Why is it called each time I loop??? in the users.html

    //SCOPE METHODS
    $scope.promoteToAdmin = function (userPromoted) {

        AdminFactory.promoteToAdmin(userPromoted._id).then(function (user) {
            console.log('UPDATED!');
            userPromoted.admin = user.admin;
        });
    };

    $scope.changePassword = function (user, data) {

        AdminFactory.changePassword(user._id, data.newPassword).then(function (user) {
            $scope.data.showDisplay = false;
            $scope.data.newPassword = '';
        });
    };
});
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('images', {
        url: '/animal/:animalID/images',
        controller: 'ImagesController',
        templateUrl: 'js/animals/images/images.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('ImagesController', function ($scope, $stateParams, AnimalsFactory) {

    AnimalsFactory.getAnimalByID($stateParams.animalID).then(function (pet) {
        $scope.pet = pet;
    });

    //SCOPE METHODS
    $scope.addImage = function () {

        if ($scope.pet.newImage && $scope.pet.newImage !== '') {
            $scope.pet.secondaryImgUrls.push($scope.pet.newImage);
            $scope.pet.newImage = undefined;
            AnimalsFactory.updateAnimal({ _id: $scope.pet._id,
                secondaryImgUrls: $scope.pet.secondaryImgUrls });
            // We have to do this instead of update the whole body to avoid a cast error for the "reviews" Path
        }
    };

    $scope.updateImage = function () {

        AnimalsFactory.updateAnimal({ _id: $scope.pet._id,
            imgUrl: $scope.pet.imgUrl
        });
    };

    $scope.deleteImage = function (index) {

        $scope.pet.secondaryImgUrls.splice(index, 1);
        AnimalsFactory.updateAnimal({ _id: $scope.pet._id,
            secondaryImgUrls: $scope.pet.secondaryImgUrls });
    };
});
'use strict';
app.factory('RandomGreetings', function () {

    var getRandomFromArray = function getRandomFromArray(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    var greetings = ['Hello, world!', 'At long last, I live!', 'Hello, simple human.', 'What a beautiful day!', 'I\'m like any other project, except that I am yours. :)', 'This empty string is for Lindsay Levine.'];

    return {
        greetings: greetings,
        getRandomGreeting: function getRandomGreeting() {
            return getRandomFromArray(greetings);
        }
    };
});
'use strict';

'use strict';
app.directive('fullstackLogo', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/fullstack-logo/fullstack-logo.html'
    };
});
'use strict';
app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function link(scope) {

            scope.items = [{ label: 'Home', state: 'home' }, { label: 'Admin', state: 'admin', admin: true }, { label: 'Settings', state: 'userSettings', auth: true }];

            scope.user = null;

            scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            scope.isAdmin = function () {
                return AuthService.isAdmin();
            }; //added by Miguel to check if the user is an Admin user

            scope.logout = function () {
                AuthService.logout().then(function () {
                    $state.go('home');
                });
            };

            var setUser = function setUser() {
                AuthService.getLoggedInUser().then(function (user) {
                    scope.user = user;
                });
            };

            var removeUser = function removeUser() {
                scope.user = null;
            };

            setUser();

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
        }

    };
});
'use strict';
app.directive('randoGreeting', function (RandomGreetings) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/rando-greeting/rando-greeting.html',
        link: function link(scope) {
            scope.greeting = RandomGreetings.getRandomGreeting();
        }
    };
});
/*$stateParams.category*/
// if(!data.validCategories){
//   $scope.error.category = "Please input a category";
//   return false;
// }
// if(!data.validCategories){
//   $scope.error.category = "Please input a category";
//   return false;
// }
// if(!data.promoName || data.promoDiscount > 100)
//   $scope.error = "Invalid Input please enter a promotional code name and a discount number below 100";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiYWRtaW4vQWRtaW5GYWN0b3J5LmpzIiwiYWRtaW4vYWRtaW4uanMiLCJhbmltYWxEZXRhaWxzL2FuaW1hbERldGFpbHMuanMiLCJhbmltYWxEZXRhaWxzL2FuaW1hbERldGFpbHNDb250cm9sbGVyLmpzIiwiYW5pbWFsX2NhdGVnb3JpZXMvYW5pbWFsX2NhdGVnb3JpZXMuanMiLCJhbmltYWxzL2FuaW1hbHMuanMiLCJhbmltYWxzL2FuaW1hbHNGYWN0b3J5LmpzIiwiY2F0ZWdvcmllcy9jYXRlZ29yaWVzLmpzIiwiY2hlY2tvdXQvY2FydEl0ZW1zLmpzIiwiY2hlY2tvdXQvY2hlY2tvdXQuanMiLCJmc2EvZnNhLXByZS1idWlsdC5qcyIsImhvbWUvaG9tZS5qcyIsIml0ZW0vaXRlbUNvbnRyb2xsZXIuanMiLCJsb2dpbi9sb2dpbi5qcyIsIm9yZGVyQWRtaW4vT3JkZXJBZG1pblRhYmxlUm93LmpzIiwib3JkZXJBZG1pbi9vcmRlckFkbWluLmpzIiwib3JkZXJBZG1pbi9vcmRlckFkbWluQ29udHJvbGxlci5qcyIsIm9yZGVyQWRtaW4vb3JkZXJBZG1pbkZhY3RvcnkuanMiLCJvcmRlckFkbWluL29yZGVyU3RhdHVzRmlsdGVyLmpzIiwib3JkZXJEZXRhaWxzL29yZGVyRGV0YWlscy5qcyIsIm9yZGVyRGV0YWlscy9vcmRlckRldGFpbHNDb250cm9sbGVyLmpzIiwib3JkZXJEZXRhaWxzL29yZGVyRGV0YWlsc0RpcmVjdGl2ZS5qcyIsIm9yZGVyRGV0YWlscy9vcmRlckl0ZW1zLmpzIiwib3JkZXJzL29yZGVyQ29udHJvbGxlci5qcyIsIm9yZGVycy9vcmRlckZvcm0uanMiLCJwcm9tb3MvUHJvbW9zRmFjdG9yeS5qcyIsInByb21vcy9wcm9tb3MuanMiLCJyZWdpc3Rlci9yZWdpc3Rlci5qcyIsInNob3BwaW5nQ2FydC9zaG9wcGluZ0NhcnRDb250cm9sbGVyLmpzIiwic2hvcHBpbmdDYXJ0L3Nob3BwaW5nQ2FydERpcmVjdGl2ZS5qcyIsInNob3BwaW5nQ2FydC9zaG9wcGluZ0NhcnRGYWN0b3J5LmpzIiwidXNlclNldHRpbmdzL3VzZXJTZXR0aW5ncy5qcyIsInVzZXJTZXR0aW5ncy91c2VyU2V0dGluZ3NDb250cm9sbGVyLmpzIiwidXNlclNldHRpbmdzL3VzZXJTZXR0aW5nc0ZhY3RvcnkuanMiLCJ1c2Vycy91c2Vycy5qcyIsImFuaW1hbHMvaW1hZ2VzL2ltYWdlcy5qcyIsImNvbW1vbi9mYWN0b3JpZXMvUmFuZG9tR3JlZXRpbmdzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9Tb2NrZXQuanMiLCJjb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiLCJjb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFBLENBQUE7QUFDQSxJQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGdCQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsYUFBQSxFQUFBLG9CQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxrQkFBQSxFQUFBLGlCQUFBLEVBQUEsMkJBQUEsRUFBQTs7QUFFQSxxQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxzQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLCtCQUFBLENBQUEsU0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7O0FBR0EsR0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOzs7QUFHQSxRQUFBLDRCQUFBLEdBQUEsc0NBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxRQUFBLDZCQUFBLEdBQUEsdUNBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQTs7OztBQUlBLGNBQUEsQ0FBQSxHQUFBLENBQUEsbUJBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBOztBQUVBLFlBQUEsNkJBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLEVBQUEsRUFBQTtBQUNBLGlCQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7U0FDQTs7QUFFQSxZQUFBLENBQUEsNEJBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7QUFFQSxZQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7O0FBR0EsYUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOzs7O0FBSUEsZ0JBQUEsSUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTthQUNBLE1BQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDM0RBLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7OztBQUdBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0Esa0JBQUEsRUFBQSxpQkFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBOzs7QUFHQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQ0EsdURBQUEsRUFDQSxxSEFBQSxFQUNBLGlEQUFBLEVBQ0EsaURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLENBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUN4QkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQTs7QUFFQSxnQkFBQSxFQUFBLG9CQUFBOztBQUVBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBOztBQUVBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQTtBQUNBLHNCQUFBLEVBQUEsd0JBQUEsRUFBQSxFQUFBLFlBQUEsRUFBQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsR0FBQSxFQUFBLEdBQUEscUJBQUEsRUFDQSxFQUFBLFFBQUEsRUFBQSxZQUFBLEVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQTtBQUNBLHNCQUFBLEVBQUEsd0JBQUEsRUFBQSxFQUFBOztBQUVBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxHQUFBLEVBQUEsR0FBQSxjQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7QUFDQSxxQkFBQSxFQUFBLHlCQUFBOztBQUVBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQTtBQUNBLHNCQUFBLEVBQUEsd0JBQUEsUUFBQSxFQUFBOztBQUVBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7QUFDQSxzQkFBQSxFQUFBLHdCQUFBLFFBQUEsRUFBQTs7QUFFQSxtQkFBQSxLQUFBLFVBQUEsQ0FBQSxrQkFBQSxHQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7QUFDQSxzQkFBQSxFQUFBLHdCQUFBLFFBQUEsRUFBQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEdBQUEsUUFBQSxDQUFBLEdBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7O0tBRUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQzVEQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFFBQUE7QUFDQSxrQkFBQSxFQUFBLGlCQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtBQUNBLFlBQUEsRUFBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUE7O0FBR0Esa0JBQUEsQ0FBQSxhQUFBLENBQUEsWUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxNQUFBLEVBQ0E7QUFDQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQy9CQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLG1CQUFBO0FBQ0Esa0JBQUEsRUFBQSx5QkFBQTtBQUNBLG1CQUFBLEVBQUEscUNBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDTkEsR0FBQSxDQUFBLFVBQUEsQ0FBQSx5QkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxZQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLEVBQUE7S0FDQSxDQUFBOztBQUVBLGtCQUFBLENBQUEsYUFBQSxDQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7OztBQUlBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLGVBQUEsV0FBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxZQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsTUFBQSxFQUNBO0FBQ0Esa0JBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBLENBQUE7S0FHQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDOUJBLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxtQkFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLDhCQUFBO0FBQ0Esa0JBQUEsRUFBQSw0QkFBQTtBQUNBLG1CQUFBLEVBQUEsNkNBQUE7Ozs7O0FBQUEsS0FLQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSw0QkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxjQUFBLEVBQUEsWUFBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLENBQUEsaUJBQUEsRUFBQSxjQUFBLENBQUEsYUFBQSxDQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7O0FBRUEsY0FBQSxDQUFBLGlCQUFBLEdBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQTs7QUFFQSxvQkFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLENBQUE7O0FBRUEsaUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTs7QUFFQSxzQkFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EscUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO2lCQUNBOztBQUVBLHFCQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBOztBQUVBLHdCQUFBLE1BQUEsQ0FBQSxpQkFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsRUFDQSxNQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxJQUFBLENBQUE7aUJBQ0E7YUFFQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7O0FBSUEsVUFBQSxDQUFBLGdCQUFBLEdBQUEsWUFBQTs7QUFFQSxZQUFBLGFBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBOztBQUVBLGlCQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBOztBQUVBLG9CQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBOztBQUVBLGlDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7aUJBQ0E7YUFDQTtTQUVBOztBQUVBLGVBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7O0FBRUEsc0JBQUEsQ0FBQSxZQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsWUFBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLEVBQUEsYUFBQSxFQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxNQUFBLEVBQ0E7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNyRUEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxVQUFBO0FBQ0Esa0JBQUEsRUFBQSxtQkFBQTtBQUNBLG1CQUFBLEVBQUEseUJBQUE7Ozs7O0FBQUEsS0FLQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSxtQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsY0FBQSxDQUFBLGFBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLE9BQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLEdBQUEsT0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUdBLFVBQUEsQ0FBQSxJQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsRUFBQTtBQUNBLHNCQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsS0FBQTtLQUNBLENBQUE7Ozs7QUFJQSxVQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLFlBQUEsU0FBQSxHQUFBO0FBQ0EsZ0JBQUEsRUFBQSxJQUFBLENBQUEsT0FBQTtBQUNBLHVCQUFBLEVBQUEsSUFBQSxDQUFBLGNBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxRQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBLENBQUEsUUFBQTtTQUNBLENBQUE7O0FBRUEsc0JBQUEsQ0FBQSxZQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsTUFBQSxFQUNBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLEdBQUEsS0FBQSxDQUFBOztBQUVBLGtCQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxNQUFBLEVBQUE7O0FBRUEsY0FBQSxDQUFBLFdBQUEsR0FBQSxTQUFBLENBQUE7O0FBRUEsc0JBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsTUFBQSxFQUNBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFdBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxRQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFFBQUEsR0FBQSxTQUFBLENBQUE7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDckZBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZ0JBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0EscUJBQUEsRUFBQSx1QkFBQSxVQUFBLEVBQUE7O0FBRUEsZ0JBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxnQkFBQSxVQUFBLEVBQUE7QUFDQSwyQkFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLENBQUE7YUFDQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsRUFBQTtBQUNBLHNCQUFBLEVBQUEsV0FBQTthQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7O0FBRUEscUJBQUEsRUFBQSx1QkFBQSxFQUFBLEVBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLEdBQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBOztBQUVBLG9CQUFBLEVBQUEsc0JBQUEsTUFBQSxFQUFBOztBQUVBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQTs7QUFFQSxvQkFBQSxFQUFBLHNCQUFBLE1BQUEsRUFBQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxFQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQTs7QUFFQSxvQkFBQSxFQUFBLHNCQUFBLE9BQUEsRUFBQSxFQUFBLEVBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxlQUFBLEdBQUEsRUFBQSxHQUFBLFlBQUEsRUFBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNyREEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLFlBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxhQUFBO0FBQ0Esa0JBQUEsRUFBQSxzQkFBQTtBQUNBLG1CQUFBLEVBQUEsK0JBQUE7Ozs7O0FBQUEsS0FLQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxzQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxFQUFBLFlBQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsSUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLEVBQUE7QUFDQSxzQkFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBOzs7QUFJQSxVQUFBLENBQUEsaUJBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxZQUFBLFdBQUEsR0FBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQSxDQUFBLE9BQUE7QUFDQSxrQkFBQSxFQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTs7QUFBQSxTQUVBLENBQUE7O0FBRUEsb0JBQUEsQ0FBQSxjQUFBLENBQUEsV0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUNBO0FBQ0Esa0JBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsRUFBQSxDQUFBO1NBRUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsY0FBQSxHQUFBLFVBQUEsUUFBQSxFQUFBOztBQUVBLGdCQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsTUFBQSxHQUFBLFFBQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxhQUFBLEdBQUEsU0FBQSxDQUFBOztBQUVBLG9CQUFBLENBQUEsY0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFDQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsY0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLG9CQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQ0E7QUFDQSxrQkFBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsWUFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxhQUFBLEdBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFNBQUEsR0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsYUFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsTUFBQSxHQUFBLFFBQUEsQ0FBQSxTQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLE9BQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLENBQUE7S0FDQSxDQUFBO0NBSUEsQ0FBQSxDQUFBO0FDckZBLEdBQUEsQ0FBQSxTQUFBLENBQUEsV0FBQSxFQUFBLFlBQUE7QUFDQSxXQUFBO0FBQ0EsbUJBQUEsRUFBQSxpQ0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ1JBLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsV0FBQTtBQUNBLGtCQUFBLEVBQUEsd0JBQUE7QUFDQSxtQkFBQSxFQUFBLDJCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDUEEsQ0FBQSxZQUFBOztBQUVBLGdCQUFBLENBQUE7OztBQUdBLFFBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBOztBQUVBLFFBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsU0FBQSxFQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBOztBQUVBLFlBQUEsTUFBQSxDQUFBOztBQUVBLFlBQUEsU0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLGtCQUFBLEdBQUEsRUFBQSxDQUFBLHVCQUFBLENBQUEsQ0FBQTtTQUNBLE1BQUE7QUFDQSxrQkFBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBOztBQUVBLGVBQUEsTUFBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBOzs7OztBQUtBLE9BQUEsQ0FBQSxRQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0Esb0JBQUEsRUFBQSxvQkFBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7QUFDQSxxQkFBQSxFQUFBLHFCQUFBO0FBQ0Esc0JBQUEsRUFBQSxzQkFBQTtBQUNBLHdCQUFBLEVBQUEsd0JBQUE7QUFDQSxxQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxFQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsWUFBQSxVQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsV0FBQSxDQUFBLGdCQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxhQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxjQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxjQUFBO1NBQ0EsQ0FBQTtBQUNBLGVBQUE7QUFDQSx5QkFBQSxFQUFBLHVCQUFBLFFBQUEsRUFBQTtBQUNBLDBCQUFBLENBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxhQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxXQUFBLEVBQ0EsVUFBQSxTQUFBLEVBQUE7QUFDQSxtQkFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtTQUNBLENBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLEVBQUEsRUFBQTs7OztBQUlBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLG1CQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsSUFBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBOzs7Ozs7QUFNQSxnQkFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTthQUNBOzs7OztBQUtBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FBQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxXQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxXQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUNBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLDRCQUFBLEVBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtBQUNBLDBCQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLFlBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxFQUFBLFlBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLENBQUEsR0FBQSxDQUFBLHdCQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLDZCQUFBLEVBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxpQkFBQSxpQkFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0E7S0FFQSxDQUFBLENBQUE7O0FBRUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBOztBQUVBLFlBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsZ0JBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxFQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7S0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLEVBQUEsQ0FBQTtBQ3hKQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEdBQUE7QUFDQSxrQkFBQSxFQUFBLG9CQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLGFBQUEsU0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsZUFBQSxDQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxPQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBOztBQUVBLFdBQUEsVUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxDQUFBLENBQUEsTUFBQSxLQUFBLFVBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSx3QkFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0E7QUFDQSxlQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxvQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxZQUFBLEVBQUEsY0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsRUFBQSxFQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEVBQUEsWUFBQSxDQUFBLGFBQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxDQUFBOztBQUVBLGFBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxpQkFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7YUFDQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLGtCQUFBLENBQUEsYUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7OztBQUlBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTs7QUFFQSxjQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxhQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7O0FBRUEsaUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxvQkFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLDBCQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2lCQUNBO2FBQ0E7U0FDQTtLQUVBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFFBQUEsR0FBQSxZQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsSUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsS0FBQSxFQUFBLEVBQ0EsY0FBQSxDQUFBLGFBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQSxLQUVBLGNBQUEsQ0FBQSxhQUFBLENBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDaEZBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZ0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFlBQUEsR0FBQSxZQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLFVBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQUE7S0FHQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGNBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG9CQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxVQUFBLENBQUEscUJBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2JBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFFBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0FBQ0Esa0JBQUEsRUFBQSxXQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsU0FBQSxFQUFBOztBQUVBLGNBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esa0JBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLFNBQUEsQ0FBQSxZQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLEdBQUEsNEJBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMzQkEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxlQUFBLEVBQUEsWUFBQTtBQUNBLFdBQUE7QUFDQSxtQkFBQSxFQUFBLDJDQUFBO0FBQ0EsZ0JBQUEsRUFBQSxJQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDTkEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxTQUFBO0FBQ0Esa0JBQUEsRUFBQSx1QkFBQTtBQUNBLG1CQUFBLEVBQUEsK0JBQUE7O0tBRUEsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUdBLEdBQUEsQ0FBQSxVQUFBLENBQUEsdUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsa0JBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLENBQUE7O0FBR0Esc0JBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQTtBQUNBLFlBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSwwQkFBQSxDQUFBLGdCQUFBLENBQUEsT0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGlCQUFBLENBQUEsTUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLHlDQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7U0FFQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsS0FBQSxDQUFBLHFCQUFBLEVBQUEsR0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUtBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxDQUFBO0NBR0EsQ0FBQSxDQUFBOztBQ25DQSxHQUFBLENBQUEsVUFBQSxDQUFBLHVCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBLGtCQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFFBQUEsR0FBQSxDQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGFBQUEsQ0FBQTs7QUFFQSxzQkFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGNBQUEsR0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxhQUFBLEdBQUEsTUFBQSxDQUFBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBO0FBQ0EsWUFBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLDBCQUFBLENBQUEsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsU0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsaUJBQUEsQ0FBQSxNQUFBLEdBQUEsU0FBQSxDQUFBO1NBRUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxtQkFBQSxDQUFBLEtBQUEsQ0FBQSxxQkFBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFLQSxVQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsQ0FBQTtDQUdBLENBQUEsQ0FBQTtBQzdCQSxHQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxXQUFBO0FBQ0Esb0JBQUEsRUFBQSx3QkFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0Esb0JBQUEsRUFBQSxzQkFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7QUFDQSx3QkFBQSxFQUFBLDBCQUFBLE9BQUEsRUFBQSxTQUFBLEVBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxjQUFBLEdBQUEsT0FBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBOztLQUdBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUN0QkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxtQkFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBLFVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxhQUFBLEVBQUEsT0FBQSxNQUFBLENBQUE7QUFDQSxZQUFBLE1BQUEsRUFBQTtBQUNBLGtCQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLG9CQUFBLEtBQUEsQ0FBQSxNQUFBLEtBQUEsYUFBQSxFQUNBLE9BQUEsS0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsTUFBQSxDQUFBO1NBQ0E7S0FHQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDYkEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxpQkFBQTtBQUNBLG1CQUFBLEVBQUEsbUNBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDTkEsR0FBQSxDQUFBLFVBQUEsQ0FBQSx3QkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxrQkFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsQ0FBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsWUFBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxVQUFBLElBQUEsSUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsS0FBQSxDQUFBLHVDQUFBLEVBQUEsR0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNiQSxHQUFBLENBQUEsU0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQTtBQUNBLG1CQUFBLEVBQUEsMkNBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxrQkFBQSxFQUFBLG9CQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsa0JBQUEsRUFBQTs7QUFFQSw4QkFBQSxDQUFBLFlBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBO2FBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSx1QkFBQSxDQUFBLEtBQUEsQ0FBQSx1Q0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDZEEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBLEVBQUEsWUFBQTtBQUNBLFdBQUE7QUFDQSxnQkFBQSxFQUNBLDhNQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO1NBQ0E7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDVEEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLEVBRUEsQ0FBQSxDQUFBO0FDRkEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLFNBQUEsQ0FBQSxXQUFBLEVBQUEsWUFBQTtBQUNBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLDBCQUFBO0FBQ0Esa0JBQUEsRUFBQSxvQkFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLGtCQUFBLENBQUEsZ0JBQUEsQ0FBQTs7QUFFQSxrQkFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLHVCQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsY0FBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHdCQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLDhCQUFBLENBQUEsbUJBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSw4QkFBQSxDQUFBLFVBQUEsR0FBQSwrQkFBQSxDQUFBO3FCQUNBLE1BQUE7QUFDQSw0QkFBQSxlQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsOEJBQUEsQ0FBQSxtQkFBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxlQUFBLENBQUE7QUFDQSw4QkFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSw4QkFBQSxDQUFBLGdCQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUE7cUJBQ0E7aUJBQ0EsQ0FBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxrQkFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLHVCQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsY0FBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLDJCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxvQkFBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EscUJBQUEsQ0FBQSxNQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EscUJBQUEsQ0FBQSxRQUFBLEdBQUEsWUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxDQUFBLGNBQUEsR0FBQSxNQUFBLENBQUEsY0FBQSxDQUFBO0FBQ0EscUJBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLGdCQUFBLENBQUE7QUFDQSw0QkFBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7O0FBRUEsMEJBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7aUJBRUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSwyQkFBQSxDQUFBLEtBQUEsQ0FBQSwrQkFBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQTthQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGNBQUEsQ0FBQSxTQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGNBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGNBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUE7U0FFQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxXQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQTtTQUNBO0FBQ0Esc0JBQUEsRUFBQSx3QkFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0Esb0JBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLHVCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSx1QkFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsdUJBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLHVCQUFBLE9BQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBO0FBQ0Esa0JBQUEsRUFBQSxvQkFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2hGQSxHQUFBLENBQUEsT0FBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFdBQUE7QUFDQSxvQkFBQSxFQUFBLHdCQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7O0FBRUEsbUJBQUEsRUFBQSxxQkFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTs7QUFFQSxtQkFBQSxFQUFBLHFCQUFBLEtBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsVUFBQSxDQUFBLGNBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ3JCQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGVBQUE7QUFDQSxrQkFBQSxFQUFBLGtCQUFBO0FBQ0EsbUJBQUEsRUFBQSx1QkFBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsVUFBQSxDQUFBLGtCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsRUFDQSxhQUFBLENBQUEsWUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE1BQUEsR0FBQSxNQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLGNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxZQUFBLFFBQUEsR0FBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUE7QUFDQSxvQkFBQSxFQUFBLElBQUEsQ0FBQSxhQUFBO0FBQ0EsdUJBQUEsRUFBQSxJQUFBLElBQUEsRUFBQTtBQUNBLDBCQUFBLEVBQUEsSUFBQSxDQUFBLGNBQUE7QUFDQSwyQkFBQSxFQUFBLElBQUEsQ0FBQSxlQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7O0FBR0EscUJBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLGVBQUEsR0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLE1BQUEsR0FBQSxNQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxhQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUEsRUFXQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDM0RBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFdBQUE7QUFDQSxtQkFBQSxFQUFBLDJCQUFBO0FBQ0Esa0JBQUEsRUFBQSxjQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7O0FBR0EsVUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLFlBQUEsRUFBQTs7QUFFQSxjQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDZCQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBO0NBSUEsQ0FBQSxDQUFBO0FDOUJBLEdBQUEsQ0FBQSxVQUFBLENBQUEsd0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxLQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsbUJBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFFBQUEsR0FBQSxZQUFBO0FBQ0EsWUFBQSxLQUFBLEdBQUEsWUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLE9BQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsU0FBQSxJQUFBLE9BQUEsQ0FBQSxLQUFBLEdBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLGtCQUFBLEdBQUEsWUFBQTtBQUNBLFlBQUEsS0FBQSxHQUFBLFlBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxPQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLFNBQUEsSUFBQSxPQUFBLENBQUEsS0FBQSxHQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLEdBQUEsWUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxHQUFBLENBQUEscUJBQUEsRUFBQSxZQUFBO0FBQ0EsY0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0Esb0JBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQTs7QUFFQSxvQkFBQSxDQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsY0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQTtBQUNBLG9CQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFlBQUEsR0FBQSxZQUFBO0FBQ0EsY0FBQSxDQUFBLFdBQUEsRUFBQSxDQUFBOzs7QUFHQSxhQUFBLENBQUEsR0FBQSxDQUFBLG9DQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLDZCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7S0FDQTtDQUVBLENBQUEsQ0FBQTtBQy9EQSxHQUFBLENBQUEsU0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLGtCQUFBLEVBQUEsd0JBQUE7QUFDQSxtQkFBQSxFQUFBLHVDQUFBOztLQUVBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNQQSxHQUFBLENBQUEsT0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxtQkFBQSxFQUFBO0FBQ0EsUUFBQSxZQUFBLEdBQUE7QUFDQSxpQkFBQSxFQUFBLG1CQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLFdBQUEsR0FBQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsUUFBQSxHQUFBLENBQUEsQ0FBQTs7QUFFQSxtQ0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO2FBQUEsTUFDQTtBQUNBLDJCQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7QUFDQSxtQ0FBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsSUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBO2FBQ0E7U0FFQTtBQUNBLDJCQUFBLEVBQUEsNkJBQUEsR0FBQSxFQUFBO0FBQ0EsK0JBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxlQUFBLEVBQUEsbUJBQUE7QUFDQSxnQkFBQSxRQUFBLEdBQUEsbUJBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLGdCQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLE9BQUEsRUFBQTtBQUNBLHVCQUFBLENBQUEsSUFBQSxDQUFBLG1CQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxPQUFBLENBQUE7U0FFQTs7QUFFQSxpQkFBQSxFQUFBLHFCQUFBO0FBQ0EsK0JBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtTQUNBO0FBQ0Esc0JBQUEsRUFBQSx3QkFBQSxHQUFBLEVBQUE7QUFDQSwrQkFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7U0FDQTtBQUNBLHNCQUFBLEVBQUEsd0JBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQTs7QUFFQSxnQkFBQSxVQUFBLEdBQUEsbUJBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLCtCQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7U0FHQTtBQUNBLHNCQUFBLEVBQUEsMEJBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7U0FFQTs7S0FJQSxDQUFBO0FBQ0EsV0FBQSxZQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDcERBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGdCQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQ0FBQTtBQUNBLGtCQUFBLEVBQUEsd0JBQUE7OztBQUdBLFlBQUEsRUFBQTtBQUNBLHdCQUFBLEVBQUEsSUFBQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7QUNiQSxHQUFBLENBQUEsVUFBQSxDQUFBLHdCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsbUJBQUEsRUFBQSxZQUFBLEVBQUE7Ozs7QUFJQSxVQUFBLENBQUEsZUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsdUJBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBOzs7O0FBSUEsY0FBQSxDQUFBLGVBQUEsR0FBQSxRQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsU0FBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE1BQUEsR0FBQSxRQUFBLENBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBS0EsQ0FBQSxDQUFBO0FDbkJBLEdBQUEsQ0FBQSxPQUFBLENBQUEscUJBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7O0FBR0EsV0FBQTtBQUNBLDBCQUFBLEVBQUEsOEJBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSx1QkFBQSxJQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7QUFDQSwwQkFBQSxFQUFBLDhCQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSwrQkFBQSxDQUFBLENBQUE7U0FDQTtBQUNBLHVCQUFBLEVBQUEsMkJBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtTQUNBOztLQUVBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNsQkEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0Esa0JBQUEsRUFBQSxpQkFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7Ozs7O0FBQUEsS0FLQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLFlBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsSUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTs7Ozs7QUFLQSxVQUFBLENBQUEsY0FBQSxHQUFBLFVBQUEsWUFBQSxFQUFBOztBQUVBLG9CQUFBLENBQUEsY0FBQSxDQUFBLFlBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQ0E7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLHdCQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBOztBQUVBLG9CQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFDQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQy9DQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLDBCQUFBO0FBQ0Esa0JBQUEsRUFBQSxrQkFBQTtBQUNBLG1CQUFBLEVBQUEsK0JBQUE7Ozs7O0FBQUEsS0FLQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxrQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxhQUFBLENBQUEsWUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOzs7QUFHQSxVQUFBLENBQUEsUUFBQSxHQUFBLFlBQUE7O0FBRUEsWUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsSUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsS0FBQSxFQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLDBCQUFBLENBQUEsWUFBQSxDQUNBLEVBQUEsR0FBQSxFQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQTtBQUNBLGdDQUFBLEVBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxnQkFBQSxFQUFBLENBQ0EsQ0FBQTs7U0FFQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBOztBQUVBLHNCQUFBLENBQUEsWUFBQSxDQUNBLEVBQUEsR0FBQSxFQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQTtBQUNBLGtCQUFBLEVBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBO1NBQ0EsQ0FDQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLGNBQUEsQ0FBQSxHQUFBLENBQUEsZ0JBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxZQUFBLENBQ0EsRUFBQSxHQUFBLEVBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBO0FBQ0EsNEJBQUEsRUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLGdCQUFBLEVBQUEsQ0FDQSxDQUFBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ25EQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsWUFBQTs7QUFFQSxRQUFBLGtCQUFBLEdBQUEsNEJBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFFBQUEsU0FBQSxHQUFBLENBQ0EsZUFBQSxFQUNBLHVCQUFBLEVBQ0Esc0JBQUEsRUFDQSx1QkFBQSxFQUNBLHlEQUFBLEVBQ0EsMENBQUEsQ0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxpQkFBQSxFQUFBLFNBQUE7QUFDQSx5QkFBQSxFQUFBLDZCQUFBO0FBQ0EsbUJBQUEsa0JBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ3ZCQSxZQUFBLENBQUE7O0FDQUEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLFNBQUEsQ0FBQSxlQUFBLEVBQUEsWUFBQTtBQUNBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLHlEQUFBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ05BLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsRUFBQTtBQUNBLG1CQUFBLEVBQUEseUNBQUE7QUFDQSxZQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUE7O0FBRUEsaUJBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FDQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxFQUNBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsRUFDQSxFQUFBLEtBQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBLGNBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQ0EsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLHVCQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLHVCQUFBLFdBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLDJCQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSwwQkFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtpQkFDQSxDQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGdCQUFBLE9BQUEsR0FBQSxtQkFBQTtBQUNBLDJCQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EseUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsZ0JBQUEsVUFBQSxHQUFBLHNCQUFBO0FBQ0EscUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxtQkFBQSxFQUFBLENBQUE7O0FBRUEsc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsRUFBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO1NBRUE7O0tBRUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ25EQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsU0FBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLGVBQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSx5REFBQTtBQUNBLFlBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQTtBQUNBLGlCQUFBLENBQUEsUUFBQSxHQUFBLGVBQUEsQ0FBQSxpQkFBQSxFQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbnZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZXhvdGljLWFuaW1hbHMnLCBbJ3VpLnJvdXRlcicsICdmc2FQcmVCdWlsdCcsICdMb2NhbFN0b3JhZ2VNb2R1bGUnXSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuICAgIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlci5zZXRQcmVmaXgoJ2V4b3RpYy1hbmltYWxzJyk7XG59KTtcblxuLy8gVGhpcyBhcHAucnVuIGlzIGZvciBjb250cm9sbGluZyBhY2Nlc3MgdG8gc3BlY2lmaWMgc3RhdGVzLlxuYXBwLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgICB2YXIgZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgIHZhciBkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBZG1pbiA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmFkbWluO1xuICAgIH07XG5cbiAgICAvLyAkc3RhdGVDaGFuZ2VTdGFydCBpcyBhbiBldmVudCBmaXJlZFxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcblxuICAgICAgICBpZiAoZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQWRtaW4odG9TdGF0ZSkgJiYgIUF1dGhTZXJ2aWNlLmlzQWRtaW4oKSkge1xuICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBkb2VzIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAvLyBUaGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLlxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAvLyBJZiBhIHVzZXIgaXMgcmV0cmlldmVkLCB0aGVuIHJlbmF2aWdhdGUgdG8gdGhlIGRlc3RpbmF0aW9uXG4gICAgICAgICAgICAvLyAodGhlIHNlY29uZCB0aW1lLCBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSB3aWxsIHdvcmspXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLCBnbyB0byBcImxvZ2luXCIgc3RhdGUuXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICphYm91dCogc3RhdGUuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Fib3V0Jywge1xuICAgICAgICB1cmw6ICcvYWJvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnQWJvdXRDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hYm91dC9hYm91dC5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0Fib3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUpIHtcblxuICAgIC8vIEltYWdlcyBvZiBiZWF1dGlmdWwgRnVsbHN0YWNrIHBlb3BsZS5cbiAgICAkc2NvcGUuaW1hZ2VzID0gW1xuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3Z0JYdWxDQUFBWFFjRS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9mYmNkbi1zcGhvdG9zLWMtYS5ha2FtYWloZC5uZXQvaHBob3Rvcy1hay14YXAxL3QzMS4wLTgvMTA4NjI0NTFfMTAyMDU2MjI5OTAzNTkyNDFfODAyNzE2ODg0MzMxMjg0MTEzN19vLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1MS1VzaElnQUV5OVNLLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjc5LVg3b0NNQUFrdzd5LmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1VajlDT0lJQUlGQWgwLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjZ5SXlGaUNFQUFxbDEyLmpwZzpsYXJnZSdcbiAgICBdO1xuXG59KTsiLCJhcHAuZmFjdG9yeSgnQWRtaW5GYWN0b3J5JywgZnVuY3Rpb24gKCRodHRwKSB7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGdldFVzZXJzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdXNlcnMnKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cocmVzcG9uc2UuZGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuICAgICAgICBjaGFuZ2VQYXNzd29yZDogZnVuY3Rpb24gKCBpZCwgbmV3X1Bhc3N3b3JkICkge1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCAnL2FwaS91c2Vycy8nK2lkK1wiL2NoYW5nZVVzZXJQYXNzd29yZFwiLCBcbiAgICAgICAgICAgICAgICB7IHBhc3N3b3JkOiBuZXdfUGFzc3dvcmQgfSApXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG4gICAgICAgIHByb21vdGVUb0FkbWluOiBmdW5jdGlvbiAoIGlkICkge1xuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCAnL2FwaS91c2Vycy8nK2lkK1wiL3Byb21vdGVVc2VyXCIgKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuICAgICAgICBnZXRDYXRlZ29yaWVzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvY2F0ZWdvcmllcycpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVDYXRlZ29yeTogZnVuY3Rpb24gKCBjYXRlZ29yeSApIHtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvY2F0ZWdvcmllcycsIGNhdGVnb3J5ICkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZUNhdGVnb3J5OiBmdW5jdGlvbiAoIGNhdGVnb3J5ICkge1xuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL2NhdGVnb3JpZXMvJytjYXRlZ29yeS5faWQgKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlQ2F0ZWdvcnk6IGZ1bmN0aW9uICggY2F0ZWdvcnkgKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvY2F0ZWdvcmllcy8nK2NhdGVnb3J5Ll9pZCwgY2F0ZWdvcnkgKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4nLCB7XG4gICAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICAgIGNvbnRyb2xsZXI6IFwiQWRtaW5Db250cm9sbGVyXCIsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYWRtaW4vYWRtaW4uaHRtbCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGFkbWluOiB0cnVlXG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQWRtaW5Db250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBBdXRoU2VydmljZSwgQW5pbWFsc0ZhY3RvcnkpIHtcblxuXHQkc2NvcGUuaXNBZG1pbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xuICAgIH07XG4gICAgICAgXG5cblx0QW5pbWFsc0ZhY3RvcnkuZ2V0QW5pbWFsQnlJRCggJHN0YXRlUGFyYW1zLmFuaW1hbElEICkudGhlbihmdW5jdGlvbihwZXQpe1xuXHRcdCRzY29wZS5wZXQgPSBwZXQ7XG5cdH0pO1xuXG5cdCRzY29wZS5zZW5kUmV2aWV3ID0gZnVuY3Rpb24oIHJldmlldyApIHtcblx0XHRBbmltYWxzRmFjdG9yeS5jcmVhdGVSZXZpZXcoIHJldmlldy5jb250ZW50LCAkc3RhdGVQYXJhbXMuYW5pbWFsSUQgKVxuXHRcdC50aGVuKCBmdW5jdGlvbiAocmV2aWV3KVxuXHRcdFx0e1xuXHRcdFx0XHQkc2NvcGUucGV0LnJldmlld3MucHVzaChyZXZpZXcpO1xuXHRcdFx0fSk7XG5cdH1cblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZGV0YWlscycsIHtcbiAgICAgICAgdXJsOiAnL2FuaW1hbC86YW5pbWFsSUQnLFxuICAgICAgICBjb250cm9sbGVyOiBcIkFuaW1hbERldGFpbHNDb250cm9sbGVyXCIsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYW5pbWFsRGV0YWlscy9hbmltYWxEZXRhaWxzLmh0bWwnXG4gICAgfSk7XG59KTtcbiIsIlxuYXBwLmNvbnRyb2xsZXIoJ0FuaW1hbERldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlUGFyYW1zLCAkc3RhdGUsIEF1dGhTZXJ2aWNlLCBBbmltYWxzRmFjdG9yeSxTaG9wcGluZ0NhcnQpIHtcbiAgICAkc2NvcGUubmV3UmV2aWV3ID0ge1xuICAgICAgICBjb250ZW50OiBcIlwiXG4gICAgfTsgICAgICAgICBcblxuXHRBbmltYWxzRmFjdG9yeS5nZXRBbmltYWxCeUlEKCAkc3RhdGVQYXJhbXMuYW5pbWFsSUQgKS50aGVuKGZ1bmN0aW9uKHBldCl7XG5cdFx0JHNjb3BlLnBldCA9IHBldDtcblx0fSk7XG5cblx0Ly9TQ09QRSBNRVRIT0RTXG5cblx0JHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgICAgICAgIH07XG5cblx0JHNjb3BlLnNlbmRSZXZpZXcgPSBmdW5jdGlvbiggcmV2aWV3ICkge1xuXHRcdEFuaW1hbHNGYWN0b3J5LmNyZWF0ZVJldmlldyggcmV2aWV3LmNvbnRlbnQsICRzdGF0ZVBhcmFtcy5hbmltYWxJRCApXG5cdFx0LnRoZW4oIGZ1bmN0aW9uIChyZXZpZXcpXG5cdFx0XHR7XG5cdFx0XHRcdCRzY29wZS5wZXQucmV2aWV3cy5wdXNoKHJldmlldyk7XG5cdFx0XHR9KTtcblx0fTtcblx0JHNjb3BlLmFkZFRvQ2FydCA9IGZ1bmN0aW9uKHBldCl7XG5cdFx0U2hvcHBpbmdDYXJ0LmFkZFRvQ2FydChwZXQpO1xuXHRcdCRzdGF0ZS5nbygkc3RhdGUuY3VycmVudCwge30sIHtyZWxvYWQ6IHRydWV9KTtcblx0XHRcblxuXHR9O1xuXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhbmltYWxfY2F0ZWdvcmllcycsIHtcbiAgICAgICAgdXJsOiAnL2FuaW1hbC86YW5pbWFsSUQvY2F0ZWdvcmllcycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFwiQW5pbWFsQ2F0ZWdvcmllc0NvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hbmltYWxfY2F0ZWdvcmllcy9hbmltYWxfY2F0ZWdvcmllcy5odG1sJ1xuICAgICAgICAvLyAsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGFkbWluOiB0cnVlXG4gICAgICAgIC8vIH1cbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQW5pbWFsQ2F0ZWdvcmllc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIEFuaW1hbHNGYWN0b3J5LCBBZG1pbkZhY3RvcnkpIHtcblxuXHRpZiAoISRzY29wZS5hbmltYWxfY2F0ZWdvcmllcykgQW5pbWFsc0ZhY3RvcnkuZ2V0QW5pbWFsQnlJRCgkc3RhdGVQYXJhbXMuYW5pbWFsSUQpXG5cdFx0LnRoZW4oZnVuY3Rpb24oYW5pbWFsKXtcblx0XHRcblx0XHQkc2NvcGUuYW5pbWFsX2NhdGVnb3JpZXMgPSBhbmltYWwuY2F0ZWdvcmllcztcblxuXHRcdEFkbWluRmFjdG9yeS5nZXRDYXRlZ29yaWVzKCkudGhlbihmdW5jdGlvbihjYXRlZ29yaWVzKXtcblx0XHRcblx0XHRcdCRzY29wZS5jYXRlZ29yaWVzID0gY2F0ZWdvcmllcztcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAkc2NvcGUuY2F0ZWdvcmllcy5sZW5ndGg7IGkrKykge1xuXG5cdFx0XHRcdCRzY29wZS5jYXRlZ29yaWVzW2ldLm1hdGNoZXMgPSBbXTtcblx0XHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCAkc2NvcGUuY2F0ZWdvcmllc1tpXS52YWx1ZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHQkc2NvcGUuY2F0ZWdvcmllc1tpXS5tYXRjaGVzLnB1c2goZmFsc2UpO1xuXHRcdFx0XHR9XG5cdFx0XG5cdFx0XHRcdGZvciAodmFyIGsgPSAwOyBrIDwgJHNjb3BlLmNhdGVnb3JpZXNbaV0udmFsdWVzLmxlbmd0aDsgaysrKSB7XG5cblx0XHRcdFx0XHRpZiAoICRzY29wZS5hbmltYWxfY2F0ZWdvcmllcy5pbmRleE9mKCRzY29wZS5jYXRlZ29yaWVzW2ldLnZhbHVlc1trXSk+PTAgKSBcblx0XHRcdFx0XHRcdCRzY29wZS5jYXRlZ29yaWVzW2ldLm1hdGNoZXNba10gPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG5cblxuXHQvL1NDT1BFIE1FVEhPRFNcblx0JHNjb3BlLnVwZGF0ZUNhdGVnb3JpZXMgPSBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBuZXdDYXRlZ29yaWVzID0gW107XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8ICRzY29wZS5jYXRlZ29yaWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8ICRzY29wZS5jYXRlZ29yaWVzW2ldLnZhbHVlcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKCRzY29wZS5jYXRlZ29yaWVzW2ldLm1hdGNoZXNbal0pIHsgXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0bmV3Q2F0ZWdvcmllcy5wdXNoKCAkc2NvcGUuY2F0ZWdvcmllc1tpXS52YWx1ZXNbal0gKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2coIG5ld0NhdGVnb3JpZXMgKTtcbiBcblx0XHRBbmltYWxzRmFjdG9yeS51cGRhdGVBbmltYWwoIHtfaWQgOiAkc3RhdGVQYXJhbXMuYW5pbWFsSUQsIGNhdGVnb3JpZXMgOiBuZXdDYXRlZ29yaWVzfSApXG5cdFx0LnRoZW4oIGZ1bmN0aW9uIChhbmltYWwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiVVBEQVRFRCFcIik7XG5cdFx0XHR9KTtcblx0XHRcblx0fVxuXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhbmltYWxzJywge1xuICAgICAgICB1cmw6ICcvYW5pbWFscycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFwiQW5pbWFsc0NvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hbmltYWxzL2FuaW1hbHMuaHRtbCdcbiAgICAgICAgLy8gLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhZG1pbjogdHJ1ZVxuICAgICAgICAvLyB9XG4gICAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignQW5pbWFsc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIEFuaW1hbHNGYWN0b3J5KSB7XG5cblx0aWYgKCEkc2NvcGUuYW5pbWFscykgQW5pbWFsc0ZhY3RvcnkuZ2V0QWxsQW5pbWFscygpLnRoZW4oZnVuY3Rpb24oYW5pbWFscyl7XG5cdFx0JHNjb3BlLmFuaW1hbHMgPSBhbmltYWxzO1xuXHR9KTtcblxuXHRcblx0JHNjb3BlLmRhdGEgPSB7XG4gICAgICAgIG5ld05hbWU6IFwiXCIsXG4gICAgICAgIG5ld0Rlc2NyaXB0aW9uOiBcIlwiLFxuICAgICAgICBuZXdQcmljZTogXCJcIixcbiAgICAgICAgbmV3U3RvY2s6IFwiXCIsXG4gICAgICAgIGNyZWF0ZUFuaW1hbDogZmFsc2VcbiAgICB9OyBcblxuXHQvLyAvL1NDT1BFIE1FVEhPRFNcblxuXHQkc2NvcGUuY3JlYXRlTmV3QW5pbWFsID0gZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XG5cdFx0dmFyIG5ld0FuaW1hbCA9IHsgXG5cdFx0XHRuYW1lOiBkYXRhLm5ld05hbWUsXG5cdFx0XHRkZXNjcmlwdGlvbjogZGF0YS5uZXdEZXNjcmlwdGlvbixcblx0XHRcdHByaWNlOiBkYXRhLm5ld1ByaWNlLFxuXHRcdFx0c3RvY2s6IGRhdGEubmV3U3RvY2tcblx0XHR9XG5cblx0XHRBbmltYWxzRmFjdG9yeS5jcmVhdGVBbmltYWwoIG5ld0FuaW1hbCApXG5cdFx0LnRoZW4oIGZ1bmN0aW9uIChhbmltYWwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiQURERUQhXCIpO1xuXHRcdFx0XHQkc2NvcGUuYW5pbWFscy5wdXNoKGFuaW1hbCk7XG5cdFx0XHRcdCRzY29wZS5kYXRhLmNyZWF0ZUFuaW1hbCA9IGZhbHNlO1xuXG5cdFx0XHRcdCRzY29wZS5kYXRhLm5ld05hbWUgPSBcIlwiO1xuICAgICAgICBcdFx0JHNjb3BlLmRhdGEubmV3RGVzY3JpcHRpb24gPSBcIlwiO1xuICAgICAgICBcdFx0JHNjb3BlLmRhdGEubmV3UHJpY2UgPSBcIlwiO1xuICAgICAgICBcdFx0JHNjb3BlLmRhdGEubmV3U3RvY2sgPSBcIlwiO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQkc2NvcGUudXBkYXRlQW5pbWFsID0gZnVuY3Rpb24oIGFuaW1hbCApIHtcblx0XHRcblx0XHRhbmltYWwuYmVpbmdFZGl0ZWQgPSB1bmRlZmluZWQ7XG5cblx0XHRBbmltYWxzRmFjdG9yeS51cGRhdGVBbmltYWwoIGFuaW1hbCApXG5cdFx0LnRoZW4oIGZ1bmN0aW9uIChhbmltYWwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiVVBEQVRFRCFcIik7XG5cdFx0XHR9KTtcblx0fVxuXG5cdCRzY29wZS5lZGl0ID0gZnVuY3Rpb24oIGFuaW1hbCApIHtcblx0XHRhbmltYWwuYmVpbmdFZGl0ZWQgPSB0cnVlO1xuXHRcdGFuaW1hbC5vbGROYW1lID0gYW5pbWFsLm5hbWU7XG5cdFx0YW5pbWFsLm9sZERlc2MgPSBhbmltYWwuZGVzY3JpcHRpb247XG5cdFx0YW5pbWFsLm9sZFByaWNlID0gYW5pbWFsLnByaWNlO1xuXHRcdGFuaW1hbC5vbGRTdG9jayA9IGFuaW1hbC5zdG9jaztcblx0fVxuXG5cdCRzY29wZS5yZXNldCA9IGZ1bmN0aW9uKCBhbmltYWwgKSB7XG5cdFx0YW5pbWFsLmJlaW5nRWRpdGVkID0gZmFsc2U7XG5cdFx0YW5pbWFsLm5hbWUgPSBhbmltYWwub2xkTmFtZTtcblx0XHRhbmltYWwuZGVzY3JpcHRpb24gPSBhbmltYWwub2xkRGVzYztcblx0XHRhbmltYWwucHJpY2UgPSBhbmltYWwub2xkUHJpY2U7XG5cdFx0YW5pbWFsLnN0b2NrID0gYW5pbWFsLm9sZFN0b2NrO1xuXHRcdGFuaW1hbC5vbGROYW1lID0gdW5kZWZpbmVkO1xuXHRcdGFuaW1hbC5vbGREZXNjID0gdW5kZWZpbmVkO1xuXHRcdGFuaW1hbC5vbGRQcmljZSA9IHVuZGVmaW5lZDtcblx0XHRhbmltYWwub2xkU3RvY2sgPSB1bmRlZmluZWQ7XG5cdH1cblxufSk7IiwiYXBwLmZhY3RvcnkoJ0FuaW1hbHNGYWN0b3J5JywgZnVuY3Rpb24gKCRodHRwKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRBbGxBbmltYWxzOiBmdW5jdGlvbiAoc2VhcmNoVGV4dCkge1xuXG4gICAgICAgICAgICB2YXIgcXVlcnlQYXJhbXMgPSB7fTtcblxuICAgICAgICAgICAgaWYgKHNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgICAgICBxdWVyeVBhcmFtcy5zZWFyY2ggPSBzZWFyY2hUZXh0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2FuaW1hbHMnLCB7XG4gICAgICAgICAgICAgICAgcGFyYW1zOiBxdWVyeVBhcmFtc1xuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0QW5pbWFsQnlJRDogZnVuY3Rpb24gKGlkKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvYW5pbWFscy8nK2lkICkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlQW5pbWFsOiBmdW5jdGlvbiAoIGFuaW1hbCApIHtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvYW5pbWFscycsIGFuaW1hbCApLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZUFuaW1hbDogZnVuY3Rpb24gKCBhbmltYWwgKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvYW5pbWFscy8nK2FuaW1hbC5faWQsIGFuaW1hbCApLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZVJldmlldzogZnVuY3Rpb24gKCBjb250ZW50LCBpZCApIHtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoICcvYXBpL2FuaW1hbHMvJytpZCtcIi9hZGRSZXZpZXdcIiwgeyBjb250ZW50OiBjb250ZW50IH0gKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG4gICAgfTtcblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY2F0ZWdvcmllcycsIHtcbiAgICAgICAgdXJsOiAnL2NhdGVnb3JpZXMnLFxuICAgICAgICBjb250cm9sbGVyOiBcIkNhdGVnb3JpZXNDb250cm9sbGVyXCIsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY2F0ZWdvcmllcy9jYXRlZ29yaWVzLmh0bWwnXG4gICAgICAgIC8vICxcbiAgICAgICAgLy8gZGF0YToge1xuICAgICAgICAvLyAgICAgYWRtaW46IHRydWVcbiAgICAgICAgLy8gfVxuICAgIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdDYXRlZ29yaWVzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZVBhcmFtcywgQXV0aFNlcnZpY2UsIEFkbWluRmFjdG9yeSkge1xuXG5cdGlmICghJHNjb3BlLmNhdGVnb3JpZXMpIEFkbWluRmFjdG9yeS5nZXRDYXRlZ29yaWVzKCkudGhlbihmdW5jdGlvbihjYXRlZ29yaWVzKXtcblx0XHQkc2NvcGUuY2F0ZWdvcmllcyA9IGNhdGVnb3JpZXM7XG5cdH0pO1xuXG5cdCRzY29wZS5kYXRhID0ge1xuICAgICAgICBuZXdOYW1lOiBcIlwiLFxuICAgICAgICBuZXdWYWx1ZXM6IFwiXCIsXG4gICAgICAgIGNyZWF0ZUNhdGVnb3J5OiBmYWxzZVxuICAgIH07IFxuXG5cblx0Ly9TQ09QRSBNRVRIT0RTXG5cdCRzY29wZS5jcmVhdGVOZXdDYXRlZ29yeSA9IGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFxuXHRcdHZhciBuZXdDYXRlZ29yeSA9IHsgXG5cdFx0XHRuYW1lOiBkYXRhLm5ld05hbWUsXG5cdFx0XHR2YWx1ZXM6IGRhdGEubmV3VmFsdWVzLnNwbGl0KC9bXFxuLF0rLykubWFwKEZ1bmN0aW9uLnByb3RvdHlwZS5jYWxsLCBTdHJpbmcucHJvdG90eXBlLnRyaW0pXG5cdFx0XHQvL1RPRE86IGlmIHR3byBvZiB0aGUgdmFsdWVzIGFyZSBlcXVhbCBpdCBmYWlscyBcblx0XHR9XG5cblx0XHRBZG1pbkZhY3RvcnkuY3JlYXRlQ2F0ZWdvcnkoIG5ld0NhdGVnb3J5IClcblx0XHQudGhlbiggZnVuY3Rpb24gKGNhdGVnb3J5KVxuXHRcdFx0e1xuXHRcdFx0XHQkc2NvcGUuY2F0ZWdvcmllcy5wdXNoKGNhdGVnb3J5KTtcblx0XHRcdFx0JHNjb3BlLmRhdGEuY3JlYXRlQ2F0ZWdvcnkgPSBmYWxzZTtcblx0XHRcdFx0JHNjb3BlLmRhdGEubmV3TmFtZSA9IFwiXCI7XG4gICAgICAgIFx0XHQkc2NvcGUuZGF0YS5uZXdWYWx1ZXMgPSBcIlwiO1xuICAgIFxuXHRcdFx0fSk7XG5cdH1cblxuXHQkc2NvcGUudXBkYXRlQ2F0ZWdvcnkgPSBmdW5jdGlvbiggY2F0ZWdvcnkgKSB7XG5cdFx0XG5cdFx0Y2F0ZWdvcnkuYmVpbmdFZGl0ZWQgPSB1bmRlZmluZWQ7XG5cdFx0Y2F0ZWdvcnkudmFsdWVzID0gY2F0ZWdvcnkubmV3RWRpdFZhbHVlcy5zcGxpdCgvW1xcbixdKy8pLm1hcChGdW5jdGlvbi5wcm90b3R5cGUuY2FsbCwgU3RyaW5nLnByb3RvdHlwZS50cmltKVxuXHRcdGNhdGVnb3J5Lm5ld0VkaXRWYWx1ZXMgPSB1bmRlZmluZWQ7XG5cblx0XHRBZG1pbkZhY3RvcnkudXBkYXRlQ2F0ZWdvcnkoIGNhdGVnb3J5IClcblx0XHQudGhlbiggZnVuY3Rpb24gKGNhdGVnb3J5KVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIlVQREFURUQhXCIpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQkc2NvcGUuZGVsZXRlQ2F0ZWdvcnkgPSBmdW5jdGlvbiggaW5kZXggKSB7XG5cblx0XHRBZG1pbkZhY3RvcnkuZGVsZXRlQ2F0ZWdvcnkoICRzY29wZS5jYXRlZ29yaWVzW2luZGV4XSApXG5cdFx0LnRoZW4oIGZ1bmN0aW9uIChjYXRlZ29yeSlcblx0XHRcdHtcblx0XHRcdFx0JHNjb3BlLmNhdGVnb3JpZXMuc3BsaWNlKGluZGV4LCAxKTtcblx0XHRcdH0pO1xuXHR9XG5cblx0JHNjb3BlLmVkaXRDYXRlZ29yeSA9IGZ1bmN0aW9uKCBjYXRlZ29yeSApIHtcblx0XHRjYXRlZ29yeS5iZWluZ0VkaXRlZCA9IHRydWU7XG5cdFx0Y2F0ZWdvcnkubmV3RWRpdFZhbHVlcyA9IGNhdGVnb3J5LnZhbHVlcy5qb2luKCk7XG5cdFx0Y2F0ZWdvcnkub2xkTmFtZSA9IGNhdGVnb3J5Lm5hbWU7XG5cdFx0Y2F0ZWdvcnkub2xkVmFsdWVzID0gY2F0ZWdvcnkudmFsdWVzO1xuXHR9XG5cblx0JHNjb3BlLnJlc2V0Q2F0ZWdvcnkgPSBmdW5jdGlvbiggY2F0ZWdvcnkgKSB7XG5cdFx0Y2F0ZWdvcnkuYmVpbmdFZGl0ZWQgPSBmYWxzZTtcblx0XHRjYXRlZ29yeS5uYW1lID0gY2F0ZWdvcnkub2xkTmFtZTtcblx0XHRjYXRlZ29yeS52YWx1ZXMgPSBjYXRlZ29yeS5vbGRWYWx1ZXM7XG5cdFx0Y2F0ZWdvcnkub2xkTmFtZSA9IHVuZGVmaW5lZDtcblx0XHRjYXRlZ29yeS5vbGRWYWx1ZXMgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHRcblxufSk7IiwiYXBwLmRpcmVjdGl2ZSgnY2FydEl0ZW1zJyxmdW5jdGlvbigpe1xuXHRyZXR1cm4ge1xuXHRcdHRlbXBsYXRlVXJsOiAnL2pzL2NoZWNrb3V0L2NhcnRJdGVtLnRtcGwuaHRtbCcsXG5cdFx0cmVzdHJpY3Q6ICdFJyxcblx0XHRzY29wZToge1xuXHRcdFx0aXRlbTogJz0nXG5cdFx0fVxuXHR9O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY2hlY2tvdXQnLCB7XG4gICAgICAgIHVybDogJy9jaGVja291dCcsXG4gICAgICAgIGNvbnRyb2xsZXI6IFwiU2hvcHBpbmdDYXJ0Q29udHJvbGxlclwiLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NoZWNrb3V0L2NoZWNrb3V0Lmh0bWwnXG4gICAgfSk7XG59KTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gSG9wZSB5b3UgZGlkbid0IGZvcmdldCBBbmd1bGFyISBEdWgtZG95LlxuICAgIGlmICghd2luZG93LmFuZ3VsYXIpIHRocm93IG5ldyBFcnJvcignSSBjYW5cXCd0IGZpbmQgQW5ndWxhciEnKTtcblxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZnNhUHJlQnVpbHQnLCBbXSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnU29ja2V0JywgZnVuY3Rpb24gKCRsb2NhdGlvbikge1xuXG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG5cbiAgICAgICAgdmFyIHNvY2tldDtcblxuICAgICAgICBpZiAoJGxvY2F0aW9uLiQkcG9ydCkge1xuICAgICAgICAgICAgc29ja2V0ID0gaW8oJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc29ja2V0ID0gaW8oJy8nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzb2NrZXQ7XG5cbiAgICB9KTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcbiAgICAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXG4gICAgICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIC8vIFVzZXMgdGhlIHNlc3Npb24gZmFjdG9yeSB0byBzZWUgaWYgYW5cbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmlzQWRtaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKCEhU2Vzc2lvbi51c2VyICYmIFNlc3Npb24udXNlci5hZG1pbik7XG4gICAgICAgIH07Ly9hZGRlZCBieSBNaWd1ZWwgdG8gY2hlY2sgaWYgdGhlIHVzZXIgaXMgYW4gQWRtaW4gdXNlclxuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF0dGFjaGVkIHRvIHRoYXQgc2Vzc2lvblxuICAgICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7IG1lc3NhZ2U6ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLicgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zaWduVXAgPSBmdW5jdGlvbihyZWdpc3RlckluZm8pIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvcmVnaXN0ZXInLCByZWdpc3RlckluZm8pXG4gICAgICAgICAgICAgICAgLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SIGF0IGZzYS1wcmUtYnVpbHRcIiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHsgbWVzc2FnZTogJ0ludmFsaWQgc2lnblVwIGNyZWRlbnRpYWxzLicgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0vL2FkZGVkIGJ5IHVzXG5cbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ1Nlc3Npb24nLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgICAgIC8vYWRkIGFkbWluIHByb3BlcnR5IC0gdGhpcyBjYW4gYmUgY2hlY2tlZCB3aXRoIG90aGVyIHNlcnZpY2UuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gKHNlc3Npb25JZCwgdXNlcikge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbn0pKCk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFwiSG9tZVBhZ2VDb250cm9sbGVyXCIsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS9ob21lLmh0bWwnXG4gICAgfSk7XG59KTtcblxuYXBwLmZpbHRlcignY2F0ZWdvcnlGaWx0ZXInLCBmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIGludGVyc2VjdChhLCBiKSB7XG5cdFx0dmFyIHQ7XG5cdCAgIFx0aWYgKGIubGVuZ3RoID4gYS5sZW5ndGgpIHQgPSBiLCBiID0gYSwgYSA9IHQ7IC8vIGluZGV4T2YgdG8gbG9vcCBvdmVyIHNob3J0ZXJcblx0ICAgXHRyZXR1cm4gYS5maWx0ZXIoZnVuY3Rpb24gKGUpIHtcblx0ICAgXHRcdGlmIChiLmluZGV4T2YoZSkgIT09IC0xKSByZXR1cm4gdHJ1ZTtcblx0ICAgXHR9KTtcblx0fVxuXG4gIHJldHVybiBmdW5jdGlvbiAoIHBldHMsIGNhdGVnb3JpZXMgKSB7XG4gICAgdmFyIGZpbHRlcmVkID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcGV0ID0gcGV0c1tpXTtcbiAgICAgIGlmIChpbnRlcnNlY3QocGV0LmNhdGVnb3JpZXMsIGNhdGVnb3JpZXMpLmxlbmd0aCA9PT0gY2F0ZWdvcmllcy5sZW5ndGgpIHtcbiAgICAgICAgZmlsdGVyZWQucHVzaChwZXQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmlsdGVyZWQ7XG4gIH07XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0hvbWVQYWdlQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZVBhcmFtcywgQWRtaW5GYWN0b3J5LCBBbmltYWxzRmFjdG9yeSkgeyAgIFxuXHQkc2NvcGUuZmlsdGVycyA9IFtdO1xuXHQkc2NvcGUucGV0cyA9IFtdO1xuXHQkc2NvcGUuc2VhcmNoRmllbGQgPSB7IHRleHQ6IFwiXCIgfTtcblxuXHRpZiAoISRzY29wZS5jYXRlZ29yaWVzKSBBZG1pbkZhY3RvcnkuZ2V0Q2F0ZWdvcmllcygpXG5cdFx0LnRoZW4oZnVuY3Rpb24oY2F0ZWdvcmllcyl7XG5cdFx0JHNjb3BlLmNhdGVnb3JpZXMgPSBjYXRlZ29yaWVzO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAkc2NvcGUuY2F0ZWdvcmllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHQkc2NvcGUuY2F0ZWdvcmllc1tpXS5tYXRjaGVzID0gW107XG5cdFx0XHRcdGZvciAodmFyIHogPSAwOyB6IDwgJHNjb3BlLmNhdGVnb3JpZXNbaV0udmFsdWVzLmxlbmd0aDsgeisrKSB7XG5cdFx0XHRcdFx0JHNjb3BlLmNhdGVnb3JpZXNbaV0ubWF0Y2hlcy5wdXNoKGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0QW5pbWFsc0ZhY3RvcnkuZ2V0QWxsQW5pbWFscyggLyokc3RhdGVQYXJhbXMuY2F0ZWdvcnkqLyApLnRoZW4oZnVuY3Rpb24ocGV0cyl7XG5cdFx0JHNjb3BlLnBldHMgPSBwZXRzO1xuXHR9KTtcblxuXG5cdC8vU0NPUEUgTUVUSE9EU1xuXHQkc2NvcGUuZmlsdGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0JHNjb3BlLmZpbHRlcnMgPSBbXTtcblx0XHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8ICRzY29wZS5jYXRlZ29yaWVzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgJHNjb3BlLmNhdGVnb3JpZXNbaV0udmFsdWVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGlmICgkc2NvcGUuY2F0ZWdvcmllc1tpXS5tYXRjaGVzW2pdKSB7IFxuXHRcdFx0XHRcdCRzY29wZS5maWx0ZXJzLnB1c2goICRzY29wZS5jYXRlZ29yaWVzW2ldLnZhbHVlc1tqXSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHR9O1xuXG5cdCRzY29wZS5zZWFyY2hCeSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0aWYgKCEkc2NvcGUuc2VhcmNoRmllbGQudGV4dCB8fCAkc2NvcGUuc2VhcmNoRmllbGQudGV4dD09PVwiXCIpIFxuXHRcdFx0QW5pbWFsc0ZhY3RvcnkuZ2V0QWxsQW5pbWFscygpLnRoZW4oZnVuY3Rpb24ocGV0cyl7XG5cdFx0JHNjb3BlLnBldHMgPSBwZXRzO1xuXHRcdH0pO1xuXHRcdFxuXHRcdGVsc2UgQW5pbWFsc0ZhY3RvcnkuZ2V0QWxsQW5pbWFscyggJHNjb3BlLnNlYXJjaEZpZWxkLnRleHQgKS50aGVuKGZ1bmN0aW9uKHBldHMpe1xuXHRcdCRzY29wZS5wZXRzID0gcGV0cztcblx0fSk7XG5cdFx0XG5cdH07XG59KTsiLCJhcHAuY29udHJvbGxlcignaXRlbUNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIFNob3BwaW5nQ2FydCwgJHJvb3RTY29wZSkge1xuICAkc2NvcGUuc2hvcHBpbmdDYXJ0ID0gU2hvcHBpbmdDYXJ0O1xuICAkc2NvcGUuYWRkVG9DYXJ0ID0gZnVuY3Rpb24ocGV0KXtcbiAgXHRTaG9wcGluZ0NhcnQuYWRkVG9DYXJ0KHBldCk7XG4gIFx0JHJvb3RTY29wZS4kYnJvYWRjYXN0KCd1cGRhdGVkU2hvcHBpbmdDYXJ0Jyk7XG5cblxuICB9O1xuICAkc2NvcGUucmVtb3ZlRnJvbUNhcnQgPSBmdW5jdGlvbihwZXQpe1xuICBcdFNob3BwaW5nQ2FydC5yZW1vdmVGcm9tQ2FydChwZXQpO1xuXHQkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3VwZGF0ZWRTaG9wcGluZ0NhcnQnKTtcbiAgfTtcbiAgXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5sb2dpbiA9IHt9O1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKGxvZ2luSW5mbykge1xuXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nO1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ29yZGVyVGFibGVSb3cnLGZ1bmN0aW9uKCl7XG5cdHJldHVybiB7XG5cdFx0dGVtcGxhdGVVcmw6J2pzL29yZGVyQWRtaW4vT3JkZXJBZG1pblRhYmxlUm93LnRtcC5odG1sJyxcblx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRzY29wZToge29yZGVyOic9J31cblx0fTtcbn0pO1xuXG4iLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdvcmRlcnMnLCB7XG4gICAgICAgIHVybDogJy9vcmRlcnMnLFxuICAgICAgICBjb250cm9sbGVyOiBcIk9yZGVyc0FkbWluQ29udHJvbGxlclwiLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL29yZGVyQWRtaW4vb3JkZXJBZG1pbi5odG1sJ1xuXG4gICAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignT3JkZXJzQWRtaW5Db250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBPcmRlcnNBZG1pbkZhY3RvcnkpIHtcblx0JHNjb3BlLm9yZGVycztcblxuXG5cdE9yZGVyc0FkbWluRmFjdG9yeS5nZXRBbGxPcmRlcnMoKS50aGVuKGZ1bmN0aW9uKG9yZGVycyl7XG5cdFx0JHNjb3BlLm9yZGVycyA9IG9yZGVycztcblx0fSk7XG5cblx0JHNjb3BlLmVkaXRTdGF0dXMgPSBmdW5jdGlvbihvcmRlcixuZXdTdGF0dXMpe1xuXHRcdHZhciBvcmRlcklkID0gb3JkZXIuX2lkO1xuXHRcdE9yZGVyc0FkbWluRmFjdG9yeS5jaGFuZ2VVc2VyU3RhdHVzKG9yZGVySWQsbmV3U3RhdHVzKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0b3JkZXIuc3RhdHVzID0gbmV3U3RhdHVzO1xuXHRcdFx0Y29uc29sZS5sb2coJ3dlIGhhdmUgc3VjY2Vzc2Z1bGx5IGNoYW5nZWQgdGhlIHN0YXR1cycsZGF0YSk7XG5cblx0XHR9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuXHRcdFx0Y29uc29sZS5lcnJvcigndGhlcmUgd2FzIGEgcHJvYmxlbScsZXJyKTtcblx0XHR9KTtcblx0fTtcblxuXG5cblxuXHQkc2NvcGUuYmVpbmdFZGl0ZWQgPSB1bmRlZmluZWQ7XG5cblxufSk7XG4iLCJcbmFwcC5jb250cm9sbGVyKCdPcmRlcnNBZG1pbkNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIE9yZGVyc0FkbWluRmFjdG9yeSkge1xuXHQkc2NvcGUub3JkZXJzO1xuXHQkc2NvcGUuc3RhdHVzZXMgPSBbJ0NyZWF0ZWQnLCdQcm9jZXNzaW5nJywnQ2FuY2VsbGVkJywnQ29tcGxldGVkJ107XG5cdCRzY29wZS5jdXJyZW50U3RhdHVzO1xuXG5cdE9yZGVyc0FkbWluRmFjdG9yeS5nZXRBbGxPcmRlcnMoKS50aGVuKGZ1bmN0aW9uKG9yZGVycyl7XG5cdFx0JHNjb3BlLm9yZGVycyA9IG9yZGVycztcblxuXHR9KTtcblx0JHNjb3BlLmZpbHRlckJ5U3RhdHVzID0gZnVuY3Rpb24oc3RhdHVzKXtcblx0XHQkc2NvcGUuY3VycmVudFN0YXR1cyA9IHN0YXR1cztcblx0fTtcblx0JHNjb3BlLmVkaXRTdGF0dXMgPSBmdW5jdGlvbihvcmRlcixuZXdTdGF0dXMpe1xuXHRcdHZhciBvcmRlcklkID0gb3JkZXIuX2lkO1xuXHRcdE9yZGVyc0FkbWluRmFjdG9yeS5jaGFuZ2VVc2VyU3RhdHVzKG9yZGVySWQsbmV3U3RhdHVzKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0b3JkZXIuc3RhdHVzID0gbmV3U3RhdHVzO1xuXG5cdFx0fSkuY2F0Y2goZnVuY3Rpb24oZXJyKXtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ3RoZXJlIHdhcyBhIHByb2JsZW0nLGVycik7XG5cdFx0fSk7XG5cdH07XG5cblxuXG5cdFx0XG5cdCRzY29wZS5iZWluZ0VkaXRlZCA9IHVuZGVmaW5lZDtcblxuXG59KTsiLCJhcHAuZmFjdG9yeSgnT3JkZXJzQWRtaW5GYWN0b3J5JyxmdW5jdGlvbigkaHR0cCl7XG5cdHJldHVybiB7XG5cdFx0Z2V0QWxsT3JkZXJzOiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9vcmRlcnMnKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LCBcblx0XHRnZXRPcmRlckJ5SUQ6IGZ1bmN0aW9uKGlkKXtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvb3JkZXJzLycraWQpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXG5cdFx0fSxcblx0XHRjaGFuZ2VVc2VyU3RhdHVzOiBmdW5jdGlvbihvcmRlcklkLCBuZXdTdGF0dXMpe1xuXG5cdFx0XHRyZXR1cm4gJGh0dHAucHV0KCcvYXBpL29yZGVycy8nK29yZGVySWQse3N0YXR1czogbmV3U3RhdHVzfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cblx0fTtcbn0pOyIsImFwcC5maWx0ZXIoJ29yZGVyU3RhdHVzRmlsdGVyJywgZnVuY3Rpb24oKXtcblx0cmV0dXJuIGZ1bmN0aW9uKG9yZGVycywgY3VycmVudFN0YXR1cyl7XG5cdFx0aWYoIWN1cnJlbnRTdGF0dXMpIHJldHVybiBvcmRlcnM7XG5cdFx0aWYob3JkZXJzKXtcblx0XHRcdG9yZGVycyA9IG9yZGVycy5maWx0ZXIoZnVuY3Rpb24ob3JkZXIpe1xuXHRcdFx0aWYob3JkZXIuc3RhdHVzID09PSBjdXJyZW50U3RhdHVzKVxuXHRcdFx0XHRyZXR1cm4gb3JkZXI7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG9yZGVycztcblx0XHR9XG5cdFx0XG5cdFx0XHRcblx0fTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ29yZGVyX2RldGFpbHMnLCB7XG4gICAgICAgIHVybDogJy9vcmRlci86b3JkZXJJRCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvb3JkZXJEZXRhaWxzL29yZGVyRGV0YWlscy5odG1sJ1xuICAgIH0pO1xufSk7XG5cbiIsImFwcC5jb250cm9sbGVyKCdPcmRlckRldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBPcmRlcnNBZG1pbkZhY3RvcnkpIHtcblxuICAkc2NvcGUudG90YWxQcmljZSA9IDA7XG5cblx0T3JkZXJzQWRtaW5GYWN0b3J5LmdldE9yZGVyQnlJRCggJHN0YXRlUGFyYW1zLm9yZGVySUQgKS50aGVuKGZ1bmN0aW9uKG9yZGVyKXtcblx0XHQkc2NvcGUub3JkZXIgPSBvcmRlcjtcbiAgICBvcmRlci5pdGVtTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGVsZW0pe1xuICAgICAgJHNjb3BlLnRvdGFsUHJpY2UgKz0gKGVsZW0ucXVhbnRpdHkqZWxlbS5wcmljZSk7XG4gICAgfSk7XG5cdH0pLmNhdGNoKGZ1bmN0aW9uKGVycil7XG5cdFx0Y29uc29sZS5lcnJvcigndGhlcmUgd2FzIGFuIGVycm9yIHdpdGggZ2V0dGluZyBvcmRlcicsZXJyKTtcblx0fSk7XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ29yZGVyRGV0YWlscycsZnVuY3Rpb24oKXtcblx0cmV0dXJuIHtcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL29yZGVyRGV0YWlscy9vcmRlckRldGFpbHNUZW1wbGF0ZS5odG1sJyxcblx0XHRyZXN0cmljdDogJ0UnLFxuXHRcdGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZVBhcmFtcywgT3JkZXJzQWRtaW5GYWN0b3J5KSB7XG5cdFxuXHRcdFx0T3JkZXJzQWRtaW5GYWN0b3J5LmdldE9yZGVyQnlJRCggJHN0YXRlUGFyYW1zLm9yZGVySUQgKS50aGVuKGZ1bmN0aW9uKG9yZGVyKXtcblx0XHRcdFx0JHNjb3BlLm9yZGVyID0gb3JkZXI7XG5cdFx0XHR9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCd0aGVyZSB3YXMgYW4gZXJyb3Igd2l0aCBnZXR0aW5nIG9yZGVyJyxlcnIpO1xuXHRcdFx0fSk7XG5cblx0XHR9XG5cdH07XG59KTsiLCJhcHAuZGlyZWN0aXZlKCdvcmRlckl0ZW1zJyxmdW5jdGlvbigpe1xuXHRyZXR1cm4ge1xuXHRcdHRlbXBsYXRlOlxuXHRcdFx0JzxkaXYgY2xhc3M9XCJyb3dcIj48aW1nIGNsYXNzPVwiY2hlY2tvdXQtaW1nXCIgc3JjPXt7aXRlbS5pdGVtLmltZ1VybH19PjwvaW1nPjxwPkl0ZW0gRGVzY3JpcHRpb246IHt7aXRlbS5pdGVtLm5hbWV9fTwvcD48cD5JdGVtIFF1YW50aXR5OiAge3tpdGVtLnF1YW50aXR5fX08L3A+IEl0ZW0gVG90YWw6IHt7aXRlbS5xdWFudGl0eSppdGVtLnByaWNlfX08L2Rpdj4nLFxuXHRcdHJlc3RyaWN0OiAnRScsXG5cdFx0c2NvcGU6IHtcblx0XHRcdGl0ZW06ICc9J1xuXHRcdH1cblx0fTtcbn0pOyIsImFwcC5jb250cm9sbGVyKCdvcmRlckNvbnRyb2xsZXInLGZ1bmN0aW9uKCRzY29wZSl7XG5cdFxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmRpcmVjdGl2ZSgnb3JkZXJGb3JtJywgZnVuY3Rpb24oKXtcblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogJ0UnLFxuXHRcdHRlbXBsYXRlVXJsOiBcImpzL29yZGVycy9vcmRlckZvcm0uaHRtbFwiLFxuXHRcdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgb3JkZXJGYWN0b3J5LCAkc3RhdGUsICRodHRwKXtcblxuICAgICAgJHNjb3BlLnByb21vRXJyb3IgPSBcIlwiO1xuXG4gICAgICAkc2NvcGUucHJvbW9BcHBsaWNhdGlvbjtcblxuICAgICAgJHNjb3BlLmFwcGx5UHJvbW8gPSBmdW5jdGlvbihwcm9tbyl7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvcHJvbW9zLycrcHJvbW8pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgaWYgKCFyZXNwb25zZS5kYXRhWzBdKXtcbiAgICAgICAgICAgICRzY29wZS5pdGVtVG90YWxEaXNjb3VudGVkID0gXCJcIjtcbiAgICAgICAgICAgICRzY29wZS5wcm9tb0Vycm9yID0gXCJTb3JyeSB0aGF0IHByb21vIGlzIG5vdCB2YWxpZFwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgZGlzY291bnRQZXJjZW50ID0gKHJlc3BvbnNlLmRhdGFbMF0uZGlzY291bnQvMTAwKTtcbiAgICAgICAgICAgICRzY29wZS5pdGVtVG90YWxEaXNjb3VudGVkID0gJHNjb3BlLml0ZW1Ub3RhbCAtICgkc2NvcGUuaXRlbVRvdGFsICogZGlzY291bnRQZXJjZW50KTtcbiAgICAgICAgICAgICRzY29wZS5wcm9tb0Vycm9yID0gXCJcIjtcbiAgICAgICAgICAgICRzY29wZS5wcm9tb0FwcGxpY2F0aW9uID0gcmVzcG9uc2UuZGF0YVswXS5faWRcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmdldFByb21vSWQgPSBmdW5jdGlvbihwcm9tbyl7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvcHJvbW9zLycrcHJvbW8pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFbMF0uX2lkO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cblx0XHRcdCRzY29wZS5zdWJtaXRPcmRlciA9IGZ1bmN0aW9uKHByb21vX25hbWUpe1xuXHRcdFx0XHR2YXIgb3JkZXIgPSB7fTtcblx0XHRcdFx0b3JkZXIuc3RhdHVzID0gJ0NyZWF0ZWQnO1xuXHRcdFx0XHRvcmRlci5pdGVtTGlzdCA9IG9yZGVyRmFjdG9yeS5tYWtlT3JkZXJJdGVtcygkc2NvcGUuaXRlbXMpO1xuXHRcdFx0XHRvcmRlci5iaWxsaW5nQWRkcmVzcyA9ICRzY29wZS5iaWxsaW5nQWRkcmVzcztcbiAgICAgICAgb3JkZXIucHJvbW8gPSAkc2NvcGUucHJvbW9BcHBsaWNhdGlvbjtcblx0XHRcdFx0b3JkZXJGYWN0b3J5LnN1Ym1pdE9yZGVyKG9yZGVyKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXG5cdFx0XHRcdFx0JHN0YXRlLmdvKCdob21lJyk7XG5cblx0XHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ3Byb2JsZW0gd2l0aCBzdWJtaXR0aW5nIG9yZGVyJyxlcnIpO1xuXHRcdFx0fSk7fTtcblx0XHRcdCRzY29wZS5iaWxsaW5nQWRkcmVzcyA9IHt9O1xuXHRcdFx0JHNjb3BlLmJpbGxpbmdBZGRyZXNzLmZpcnN0TmFtZTtcblx0XHRcdCRzY29wZS5iaWxsaW5nQWRkcmVzcy5sYXN0TmFtZTtcblx0XHRcdCRzY29wZS5iaWxsaW5nQWRkcmVzcy5Db21wYW55O1xuXHRcdCAgICAkc2NvcGUuYmlsbGluZ0FkZHJlc3MuQWRkcmVzcztcblx0XHQgICAgJHNjb3BlLmJpbGxpbmdBZGRyZXNzLkFkZHJlc3MyO1xuXHRcdCAgICAkc2NvcGUuYmlsbGluZ0FkZHJlc3MuQ2l0eTtcblx0XHQgICAgJHNjb3BlLmJpbGxpbmdBZGRyZXNzLlpJUDtcblx0XHQgICAgJHNjb3BlLmJpbGxpbmdBZGRyZXNzLkNvdW50cnk7XG5cdFx0ICAgICRzY29wZS5iaWxsaW5nQWRkcmVzcy5TdGF0ZTtcblx0XHQgICAgJHNjb3BlLmJpbGxpbmdBZGRyZXNzLlBob25lO1xuXG5cdFx0fVxuXHR9O1xufSk7XG5cbmFwcC5mYWN0b3J5KCdvcmRlckZhY3RvcnknLGZ1bmN0aW9uKCRodHRwKXtcblx0cmV0dXJuIHtcblx0XHRzdWJtaXRPcmRlcjogZnVuY3Rpb24ob3JkZXIpe1xuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvb3JkZXJzJyxvcmRlcik7XG5cdFx0fSxcblx0XHRtYWtlT3JkZXJJdGVtczogZnVuY3Rpb24oaXRlbXMpe1xuXHRcdFx0cmV0dXJuIGl0ZW1zLm1hcChmdW5jdGlvbihpdGVtKXtcblx0XHRcdFx0dmFyIG5ld0l0ZW0gPSB7fTtcblx0XHRcdFx0bmV3SXRlbS5pdGVtID0gaXRlbS5faWQ7XG5cdFx0XHRcdG5ld0l0ZW0ucXVhbnRpdHkgPSBpdGVtLnF1YW50aXR5O1xuXHRcdFx0XHRuZXdJdGVtLnByaWNlID0gaXRlbS5wcmljZTtcblx0XHRcdFx0cmV0dXJuIG5ld0l0ZW07XG5cdFx0XHR9KTtcblxuXHRcdH0sXG4gICAgZ2V0UHJvbW9JZDogZnVuY3Rpb24ob3JkZXIpe1xuICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvb3JkZXJzJyxvcmRlcik7XG4gICAgfVxuXHR9O1xuXG59KTsiLCJhcHAuZmFjdG9yeSgnUHJvbW9zRmFjdG9yeScsIGZ1bmN0aW9uICgkaHR0cCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGdldEFsbFByb21vczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9wcm9tb3MnKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlUHJvbW86IGZ1bmN0aW9uIChwcm9tbykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvcHJvbW9zJywge3Byb21vOiBwcm9tb30pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZWxldGVQcm9tbzogZnVuY3Rpb24gKHByb21vKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL3Byb21vcy8nK3Byb21vLl9pZCApLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3Byb21vcycsIHtcbiAgICAgICAgdXJsOiAnL3Byb21vcy86Y29kZScsXG4gICAgICAgIGNvbnRyb2xsZXI6IFwiUHJvbW9zQ29udHJvbGxlclwiLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3Byb21vcy9wcm9tb3MuaHRtbCdcbiAgICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdQcm9tb3NDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBQcm9tb3NGYWN0b3J5KSB7XG5cbiAgJHNjb3BlLmVycm9yID0ge307XG5cbiAgaWYgKCEkc2NvcGUucHJvbW9zKVxuICAgIFByb21vc0ZhY3RvcnkuZ2V0QWxsUHJvbW9zKCkudGhlbihmdW5jdGlvbihwcm9tb3Mpe1xuICAgICRzY29wZS5wcm9tb3MgPSBwcm9tb3M7XG4gIH0pO1xuXG4gICRzY29wZS5jcmVhdGVOZXdQcm9tbyA9IGZ1bmN0aW9uKGRhdGEpe1xuXG4gICAgdmFyIG5ld1Byb21vID0ge1xuICAgICAgbmFtZTogZGF0YS5wcm9tb05hbWUsXG4gICAgICBkaXNjb3VudDogZGF0YS5wcm9tb0Rpc2NvdW50LFxuICAgICAgY3JlYXRlZERhdGUgOiBuZXcgRGF0ZSgpLFxuICAgICAgZXhwaXJhdGlvbkRhdGUgOiBkYXRhLmV4cGlyYXRpb25EYXRlLFxuICAgICAgdmFsaWRDYXRlZ29yaWVzOiBkYXRhLnZhbGlkQ2F0ZWdvcmllcy5zcGxpdCgvW1xcbixdKy8pLm1hcChGdW5jdGlvbi5wcm90b3R5cGUuY2FsbCwgU3RyaW5nLnByb3RvdHlwZS50cmltKVxuICAgIH07XG5cblxuICAgIFByb21vc0ZhY3RvcnkuY3JlYXRlUHJvbW8obmV3UHJvbW8pLnRoZW4oZnVuY3Rpb24ocHJvbW8pe1xuICAgICAgICAkc2NvcGUucHJvbW9zLnB1c2gocHJvbW8pO1xuICAgICAgICAkc2NvcGUuZGF0YS5jcmVhdGVQcm9tbyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUuZGF0YS5wcm9tb05hbWUgPSBcIlwiO1xuICAgICAgICAkc2NvcGUuZGF0YS5wcm9tb0Rpc2NvdW50ID0gXCJcIjtcbiAgICAgICAgJHNjb3BlLmRhdGEuZXhwaXJhdGlvbkRhdGUgPSBcIlwiO1xuICAgICAgICAkc2NvcGUuZGF0YS52YWxpZENhdGVnb3JpZXMgPSBcIlwiO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5kZWxldGVQcm9tbyA9IGZ1bmN0aW9uKHByb21vKXtcbiAgICBQcm9tb3NGYWN0b3J5LmRlbGV0ZVByb21vKHByb21vKS50aGVuKGZ1bmN0aW9uKHByb21vcyl7XG4gICAgICAkc2NvcGUucHJvbW9zID0gcHJvbW9zO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5wcm9tb1ZhbGlkYXRlID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgLy8gaWYoIWRhdGEudmFsaWRDYXRlZ29yaWVzKXtcbiAgICAvLyAgICRzY29wZS5lcnJvci5jYXRlZ29yeSA9IFwiUGxlYXNlIGlucHV0IGEgY2F0ZWdvcnlcIjtcbiAgICAvLyAgIHJldHVybiBmYWxzZTtcbiAgICAvLyB9XG4gICAgLy8gaWYoIWRhdGEudmFsaWRDYXRlZ29yaWVzKXtcbiAgICAvLyAgICRzY29wZS5lcnJvci5jYXRlZ29yeSA9IFwiUGxlYXNlIGlucHV0IGEgY2F0ZWdvcnlcIjtcbiAgICAvLyAgIHJldHVybiBmYWxzZTtcbiAgICAvLyB9XG4gICAgLy8gaWYoIWRhdGEucHJvbW9OYW1lIHx8IGRhdGEucHJvbW9EaXNjb3VudCA+IDEwMClcbiAgICAvLyAgICRzY29wZS5lcnJvciA9IFwiSW52YWxpZCBJbnB1dCBwbGVhc2UgZW50ZXIgYSBwcm9tb3Rpb25hbCBjb2RlIG5hbWUgYW5kIGEgZGlzY291bnQgbnVtYmVyIGJlbG93IDEwMFwiO1xuICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3JlZ2lzdGVyJywge1xuICAgICAgICB1cmw6ICcvcmVnaXN0ZXInLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3JlZ2lzdGVyL3JlZ2lzdGVyLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUmVnaXN0ZXJDdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1JlZ2lzdGVyQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5sb2dpbiA9IHt9O1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAvL1NDT1BFIE1FVEhPRFNcbiAgICAkc2NvcGUucmVnaXN0ZXJVc2VyID0gZnVuY3Rpb24gKHJlZ2lzdGVySW5mbykge1xuXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAgICAgQXV0aFNlcnZpY2Uuc2lnblVwKHJlZ2lzdGVySW5mbykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgc2lnblVwIGNyZWRlbnRpYWxzLic7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuXG5cbn0pOyIsImFwcC5jb250cm9sbGVyKCdTaG9wcGluZ0NhcnRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlUGFyYW1zLCAgJHJvb3RTY29wZSwgU2hvcHBpbmdDYXJ0LCAkaHR0cCkge1xuXG5cdCRzY29wZS5pdGVtcyA9IFtdO1xuXHQkc2NvcGUuaXRlbVF1YW50aXR5O1xuICAkc2NvcGUuaXRlbVRvdGFsID0gMDtcbiAgJHNjb3BlLml0ZW1Ub3RhbERpc2NvdW50ZWQgPSBudWxsO1xuXG4gICRzY29wZS5nZXRUb3RhbCA9IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgaXRlbXMgPSBTaG9wcGluZ0NhcnQuZ2V0Q2FydCgpO1xuICAgICAgaXRlbXMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KXtcbiAgICAgICAgJHNjb3BlLml0ZW1Ub3RhbCArPSBlbGVtZW50LnByaWNlICogZWxlbWVudC5xdWFudGl0eTtcbiAgICAgIH0pXG4gIH07XG5cbiAgJHNjb3BlLmdldERpc2NvdW50ZWRUb3RhbCA9IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgaXRlbXMgPSBTaG9wcGluZ0NhcnQuZ2V0Q2FydCgpO1xuICAgICAgaXRlbXMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KXtcbiAgICAgICAgJHNjb3BlLml0ZW1Ub3RhbCArPSBlbGVtZW50LnByaWNlICogZWxlbWVudC5xdWFudGl0eTtcbiAgICAgIH0pXG4gIH07XG5cblx0JHNjb3BlLmdldEFsbEl0ZW1zID0gZnVuY3Rpb24oKXtcblx0XHQkc2NvcGUuaXRlbXMgPSBTaG9wcGluZ0NhcnQuZ2V0Q2FydCgpO1xuICAgICRzY29wZS5nZXRUb3RhbCgpO1xuXHR9O1xuXHQkcm9vdFNjb3BlLiRvbigndXBkYXRlZFNob3BwaW5nQ2FydCcsZnVuY3Rpb24oKXtcbiAgICAkc2NvcGUuZ2V0VG90YWwoKTtcblx0ICAkc2NvcGUuZ2V0QWxsSXRlbXMoKTtcblx0fSk7XG5cdCRzY29wZS5jbGVhckNhcnQgPSBmdW5jdGlvbigpe1xuXHRcdFNob3BwaW5nQ2FydC5jbGVhckNhcnQoKTtcblx0XHQkc2NvcGUuZ2V0QWxsSXRlbXMoKTtcblx0fTtcblxuXHQkc2NvcGUucmVtb3ZlSXRlbSA9IGZ1bmN0aW9uKHBldCl7XG5cblx0XHRTaG9wcGluZ0NhcnQucmVtb3ZlRnJvbUNhcnQocGV0KTtcblx0XHQkc2NvcGUuZ2V0QWxsSXRlbXMoKTtcblx0fTtcblx0JHNjb3BlLnVwZGF0ZVF1YW50aXR5ID0gZnVuY3Rpb24oaXRlbSwgcXVhbnQpe1xuXHRcdFNob3BwaW5nQ2FydC51cGRhdGVRdWFudGl0eShpdGVtLCBxdWFudCk7XG5cdFx0JHNjb3BlLmdldEFsbEl0ZW1zKCk7XG5cdH07XG5cblx0JHNjb3BlLnNlbmRDYXJ0VG9EQiA9IGZ1bmN0aW9uKCl7XG5cdFx0JHNjb3BlLmdldEFsbEl0ZW1zKCk7XG5cdFx0Ly90aGlzIG5lZWRzIHRvIGJlIHVwZGF0ZWQgdG8gb3RoZXIgY2FydFxuXG5cdFx0JGh0dHAucHV0KCcvYXBpL2NhcnQvNTUzOTFjYTY4OTFjNTA3NzE2MDI0ZmQ3Jywkc2NvcGUuaXRlbXMpXG5cdFx0LnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdzZW5kaW5nIGRhdGEgZnJvbSBmcm9udCBlbmQnLGRhdGEpO1xuXHRcdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0Y29uc29sZS5lcnJvcihlcnIpO1xuXHRcdH0pO1xuXG5cdH07XG5cblx0JHNjb3BlLmdldEFsbEl0ZW1zKCk7XG5cdGlmKCRzY29wZS5pdGVtcy5sZW5ndGg9PT0wKXtcblx0XHRTaG9wcGluZ0NhcnQucmV0cmlldmVGcm9tREIoKTtcblx0fVxuXG59KTsiLCJhcHAuZGlyZWN0aXZlKCdzaG9wcGluZ0NhcnQnLGZ1bmN0aW9uKCl7XG5cdHJldHVybiB7XG5cdFx0cmVzdHJpY3Q6J0UnLFxuXHRcdGNvbnRyb2xsZXI6ICdTaG9wcGluZ0NhcnRDb250cm9sbGVyJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL3Nob3BwaW5nQ2FydC9TaG9wcGluZ0NhcnQudG1wLmh0bWwnXG5cblx0fTtcbn0pOyIsImFwcC5mYWN0b3J5KCdTaG9wcGluZ0NhcnQnLCBmdW5jdGlvbigkaHR0cCwgbG9jYWxTdG9yYWdlU2VydmljZSkge1xuICB2YXIgU2hvcHBpbmdDYXJ0ID0ge1xuICAgICAgYWRkVG9DYXJ0OiBmdW5jdGlvbihwZXQpe1xuICAgICAgICB2YXIgZXhpc3RpbmdQZXQgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChwZXQubmFtZSk7XG4gICAgICAgIGlmKCFleGlzdGluZ1BldCkge1xuICAgICAgICAgIHBldC5xdWFudGl0eSA9IDE7XG4gICAgICAgICAgXG4gICAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQocGV0Lm5hbWUsIHBldCk7fVxuICAgICAgICBlbHNle1xuICAgICAgICAgIGV4aXN0aW5nUGV0LnF1YW50aXR5Kys7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQoZXhpc3RpbmdQZXQubmFtZSwgZXhpc3RpbmdQZXQpO1xuICAgICAgICB9XG5cbiAgICAgIH0sXG4gICAgICByZXRyaWV2ZVBldEZyb21DYXJ0IDpmdW5jdGlvbihwZXQpe1xuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChwZXQubmFtZSk7XG4gICAgICB9LFxuICAgICAgZ2V0Q2FydCA6ZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHBldE5hbWVzID0gbG9jYWxTdG9yYWdlU2VydmljZS5rZXlzKCk7XG4gICAgICAgIHZhciBjYXJ0QXJyID0gW107XG4gICAgICAgIHBldE5hbWVzLmZvckVhY2goZnVuY3Rpb24ocGV0TmFtZSl7XG4gICAgICAgICAgY2FydEFyci5wdXNoKGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHBldE5hbWUpKTtcbiAgICAgICAgfSk7XG4gICAgICAgcmV0dXJuIGNhcnRBcnI7XG5cbiAgICAgIH0sXG5cbiAgICAgIGNsZWFyQ2FydCA6ZnVuY3Rpb24oKXtcbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5jbGVhckFsbCgpO1xuICAgICAgfSxcbiAgICAgIHJlbW92ZUZyb21DYXJ0OiBmdW5jdGlvbihwZXQpe1xuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShwZXQubmFtZSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlUXVhbnRpdHk6IGZ1bmN0aW9uKHBldCwgcXVhbnQpe1xuXG4gICAgICAgIHZhciB1cGRhdGVkUGV0ID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocGV0Lm5hbWUpO1xuXG4gICAgICAgIHVwZGF0ZWRQZXQucXVhbnRpdHkgPSBxdWFudDtcbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQodXBkYXRlZFBldC5uYW1lLHVwZGF0ZWRQZXQpO1xuXG5cbiAgICAgIH0sXG4gICAgICByZXRyaWV2ZUZyb21EQjogZnVuY3Rpb24oKXtcbiAgICAgICAgLy93aWxsIGFsc28gbmVlZCB0byBoYXZlIHNvbWUgbWVjaGFuaXNtIHRvIGF0dGFjaCB0aGlzIHRvIGxvY2FsIHN0b3JhZ2UuXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvY2FydC9nZXRZb3VyQ2FydCcpO1xuICAgICAgICBcbiAgICAgIH1cblxuXG5cbiAgfTtcbiAgcmV0dXJuIFNob3BwaW5nQ2FydDtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd1c2VyU2V0dGluZ3MnLCB7XG4gICAgICAgIHVybDogJy91c2VyLXNldHRpbmdzJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy91c2VyU2V0dGluZ3MvdXNlclNldHRpbmdzLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBcIlVzZXJTZXR0aW5nc0NvbnRyb2xsZXJcIixcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBkYXRhLmF1dGhlbnRpY2F0ZSBpcyByZWFkIGJ5IGFuIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIC8vIHRoYXQgY29udHJvbHMgYWNjZXNzIHRvIHRoaXMgc3RhdGUuIFJlZmVyIHRvIGFwcC5qcy5cbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIH1cbiAgICB9KTtcblxufSk7XG5cbi8vIGFwcC5mYWN0b3J5KCdTZWNyZXRTdGFzaCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuXG4vLyAgICAgdmFyIGdldFN0YXNoID0gZnVuY3Rpb24gKCkge1xuLy8gICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL21lbWJlcnMvc2VjcmV0LXN0YXNoJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbi8vICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuLy8gICAgICAgICB9KTtcbi8vICAgICB9O1xuXG4vLyAgICAgcmV0dXJuIHtcbi8vICAgICAgICAgZ2V0U3Rhc2g6IGdldFN0YXNoXG4vLyAgICAgfTtcblxuLy8gfSk7IiwiYXBwLmNvbnRyb2xsZXIoJ1VzZXJTZXR0aW5nc0NvbnRyb2xsZXInLGZ1bmN0aW9uKCRzY29wZSwgIFVzZXJTZXR0aW5nc0ZhY3RvcnksIFNob3BwaW5nQ2FydCl7XG5cdC8vIHRoZSB1c2VyIHNldHRpbmdzIGNvbnRyb2xsZXIgbmVlZHMgdG8gbWFuYWdlIGluZm9ybWF0aW9uIGFib3V0XG5cdC8vIHVzZXJzIGZyb20gZGF0YWJhc2VcblxuXHQkc2NvcGUudXNlckluZm9ybWF0aW9uID0ge307XG5cdCRzY29wZS5jYXJ0SXRlbXMgPSBbXTtcblx0VXNlclNldHRpbmdzRmFjdG9yeS5nZXRVc2VySW5mb3JtYXRpb24oKVxuXHQudGhlbihmdW5jdGlvbih1c2VySW5mbyl7XG5cdFx0Ly93ZSBuZWVkIHRvIGRldGVybWluZSBhIHdheSB0byBwb3B1bGF0ZSBpdGVtIElEcy5cblx0XHQvL3RoaXMgY291bGQgYmUgZG9uZSB3aXRoIGEgc2ltcGxlIEdldCB0byB0aGUgaXRlbSBBUEksIGJ1dFxuXHRcdC8vaSBhbSB0aGlua2luZyBwZXJoYXBzIERlZXAgUG9wdWxhdGUgd291bGQgYmUgbW9yZSBlbGVnYW50P1xuXHRcdCRzY29wZS51c2VySW5mb3JtYXRpb24gPSB1c2VySW5mbztcblx0XHQkc2NvcGUuY2FydEl0ZW1zID0gdXNlckluZm8uY2FydC5pdGVtcztcblx0XHQkc2NvcGUudXNlcklkID0gdXNlckluZm8uaWQ7XG5cdH0pO1xuXG5cblxuXG59KTsiLCJhcHAuZmFjdG9yeShcIlVzZXJTZXR0aW5nc0ZhY3RvcnlcIixmdW5jdGlvbigkaHR0cCl7XG5cdC8vdGhlIHVzZXIgc2V0dGluZ3MgZmFjdG9yeSBuZWVkcyB0byBjb211bmljYXRlIHdpdGggdGhlIHNlcnZlclxuXHQvL2FuZCByZXRyaWV2ZSBhbGwgbmVjZXNzYXJ5IGluZm9ybWF0aW9uIGZvciB1c2VyIHNldHRpbmdzIHBhZ2Vcblx0cmV0dXJuIHtcblx0XHRnZXRVc2VySW5mb3JtYXRpb246IGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3VzZXJzL3VzZXJJbmZvcm1hdGlvbicpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdHJldHVybiBkYXRhLmRhdGE7XG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cdFx0Y2hhbmdlVXNlclBhc3N3b3JkOiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuICRodHRwLnB1dCgnL2FwaS91c2Vycy9jaGFuZ2VZb3VyUGFzc3dvcmQnKTtcblx0XHR9LFxuXHRcdGNoYW5nZVVzZXJFbWFpbDogZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiAkaHR0cC5wdXQoJy9hcGkvdXNlcnMvY2hhbmdlWW91ckVtYWlsJyk7XG5cdFx0fVxuXG5cdH07XG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd1c2VycycsIHtcbiAgICAgICAgdXJsOiAnL3VzZXJzJyxcbiAgICAgICAgY29udHJvbGxlcjogXCJVc2Vyc0NvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy91c2Vycy91c2Vycy5odG1sJ1xuICAgICAgICAvLyAsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGFkbWluOiB0cnVlXG4gICAgICAgIC8vIH1cbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignVXNlcnNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBBdXRoU2VydmljZSwgQWRtaW5GYWN0b3J5KSB7XG5cblx0aWYgKCEkc2NvcGUudXNlcnMpIEFkbWluRmFjdG9yeS5nZXRVc2VycygpLnRoZW4oZnVuY3Rpb24odXNlcnMpe1xuXHRcdCRzY29wZS51c2VycyA9IHVzZXJzO1xuXHR9KTtcblxuXHQkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgbmV3UGFzc3dvcmQ6IFwiXCIsXG4gICAgICAgIHNob3dEaXNwbGF5OiBmYWxzZVxuICAgIH07IFxuXG5cdC8vV2h5IGlzIGl0IGNhbGxlZCBlYWNoIHRpbWUgSSBsb29wPz8/IGluIHRoZSB1c2Vycy5odG1sXG5cblx0Ly9TQ09QRSBNRVRIT0RTXG5cdCRzY29wZS5wcm9tb3RlVG9BZG1pbiA9IGZ1bmN0aW9uKCB1c2VyUHJvbW90ZWQgKSB7XG5cdFx0XG5cdFx0QWRtaW5GYWN0b3J5LnByb21vdGVUb0FkbWluKCB1c2VyUHJvbW90ZWQuX2lkIClcblx0XHQudGhlbiggZnVuY3Rpb24gKHVzZXIpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiVVBEQVRFRCFcIik7XG5cdFx0XHRcdHVzZXJQcm9tb3RlZC5hZG1pbiA9IHVzZXIuYWRtaW47XG5cdFx0XHR9KTtcblx0fTtcblxuXHQkc2NvcGUuY2hhbmdlUGFzc3dvcmQgPSBmdW5jdGlvbiggdXNlciwgZGF0YSApIHtcblx0XHRcblx0XHRBZG1pbkZhY3RvcnkuY2hhbmdlUGFzc3dvcmQoIHVzZXIuX2lkLCBkYXRhLm5ld1Bhc3N3b3JkIClcblx0XHQudGhlbiggZnVuY3Rpb24gKHVzZXIpXG5cdFx0XHR7XG5cdFx0XHRcdCRzY29wZS5kYXRhLnNob3dEaXNwbGF5ID0gZmFsc2U7XG5cdFx0XHRcdCRzY29wZS5kYXRhLm5ld1Bhc3N3b3JkID0gXCJcIjtcblx0XHRcdH0pO1xuXHR9O1xuXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdpbWFnZXMnLCB7XG4gICAgICAgIHVybDogJy9hbmltYWwvOmFuaW1hbElEL2ltYWdlcycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFwiSW1hZ2VzQ29udHJvbGxlclwiLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FuaW1hbHMvaW1hZ2VzL2ltYWdlcy5odG1sJ1xuICAgICAgICAvLyAsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGFkbWluOiB0cnVlXG4gICAgICAgIC8vIH1cbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignSW1hZ2VzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZVBhcmFtcywgQW5pbWFsc0ZhY3RvcnkpIHtcblxuXHRBbmltYWxzRmFjdG9yeS5nZXRBbmltYWxCeUlEKCAkc3RhdGVQYXJhbXMuYW5pbWFsSUQgKS50aGVuKGZ1bmN0aW9uKHBldCl7XG5cdFx0JHNjb3BlLnBldCA9IHBldDtcblx0fSk7XG5cblx0Ly9TQ09QRSBNRVRIT0RTXG5cdCRzY29wZS5hZGRJbWFnZSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0aWYgKCRzY29wZS5wZXQubmV3SW1hZ2UgJiYgJHNjb3BlLnBldC5uZXdJbWFnZSAhPT0gXCJcIikge1xuXHRcdFx0JHNjb3BlLnBldC5zZWNvbmRhcnlJbWdVcmxzLnB1c2goJHNjb3BlLnBldC5uZXdJbWFnZSk7XG5cdFx0XHQkc2NvcGUucGV0Lm5ld0ltYWdlID0gdW5kZWZpbmVkO1xuXHRcdFx0QW5pbWFsc0ZhY3RvcnkudXBkYXRlQW5pbWFsKFxuXHRcdFx0XHR7IFx0X2lkOiAkc2NvcGUucGV0Ll9pZCxcblx0XHRcdFx0XHRzZWNvbmRhcnlJbWdVcmxzOiAkc2NvcGUucGV0LnNlY29uZGFyeUltZ1VybHN9XG5cdFx0XHQpO1xuXHRcdC8vIFdlIGhhdmUgdG8gZG8gdGhpcyBpbnN0ZWFkIG9mIHVwZGF0ZSB0aGUgd2hvbGUgYm9keSB0byBhdm9pZCBhIGNhc3QgZXJyb3IgZm9yIHRoZSBcInJldmlld3NcIiBQYXRoXG5cdFx0fVx0XG5cdH07XG5cblx0JHNjb3BlLnVwZGF0ZUltYWdlID0gZnVuY3Rpb24oKSB7XG5cblx0XHRBbmltYWxzRmFjdG9yeS51cGRhdGVBbmltYWwoXG5cdFx0XHR7IFx0X2lkOiAkc2NvcGUucGV0Ll9pZCxcblx0XHRcdFx0aW1nVXJsOiAkc2NvcGUucGV0LmltZ1VybFxuXHRcdFx0fVxuXHRcdCk7XHRcblx0fTtcblxuXHQkc2NvcGUuZGVsZXRlSW1hZ2UgPSBmdW5jdGlvbiggaW5kZXggKSB7XG5cblx0XHQkc2NvcGUucGV0LnNlY29uZGFyeUltZ1VybHMuc3BsaWNlKCBpbmRleCwgMSk7XG5cdFx0QW5pbWFsc0ZhY3RvcnkudXBkYXRlQW5pbWFsKFxuXHRcdFx0eyBcdF9pZDogJHNjb3BlLnBldC5faWQsXG5cdFx0XHRcdHNlY29uZGFyeUltZ1VybHM6ICRzY29wZS5wZXQuc2Vjb25kYXJ5SW1nVXJsc31cblx0XHQpO1xuXHR9O1xuXHRcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5mYWN0b3J5KCdSYW5kb21HcmVldGluZ3MnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgZ2V0UmFuZG9tRnJvbUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICAgICAgICByZXR1cm4gYXJyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFyci5sZW5ndGgpXTtcbiAgICB9O1xuXG4gICAgdmFyIGdyZWV0aW5ncyA9IFtcbiAgICAgICAgJ0hlbGxvLCB3b3JsZCEnLFxuICAgICAgICAnQXQgbG9uZyBsYXN0LCBJIGxpdmUhJyxcbiAgICAgICAgJ0hlbGxvLCBzaW1wbGUgaHVtYW4uJyxcbiAgICAgICAgJ1doYXQgYSBiZWF1dGlmdWwgZGF5IScsXG4gICAgICAgICdJXFwnbSBsaWtlIGFueSBvdGhlciBwcm9qZWN0LCBleGNlcHQgdGhhdCBJIGFtIHlvdXJzLiA6KScsXG4gICAgICAgICdUaGlzIGVtcHR5IHN0cmluZyBpcyBmb3IgTGluZHNheSBMZXZpbmUuJ1xuICAgIF07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBncmVldGluZ3M6IGdyZWV0aW5ncyxcbiAgICAgICAgZ2V0UmFuZG9tR3JlZXRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRSYW5kb21Gcm9tQXJyYXkoZ3JlZXRpbmdzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pOyIsIid1c2Ugc3RyaWN0JztcbiIsIid1c2Ugc3RyaWN0JztcbmFwcC5kaXJlY3RpdmUoJ2Z1bGxzdGFja0xvZ28nLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5odG1sJ1xuICAgIH07XG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsIEFVVEhfRVZFTlRTLCAkc3RhdGUpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcblxuICAgICAgICAgICAgc2NvcGUuaXRlbXMgPSBbXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0hvbWUnLCBzdGF0ZTogJ2hvbWUnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0FkbWluJywgc3RhdGU6ICdhZG1pbicsIGFkbWluOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ1NldHRpbmdzJywgc3RhdGU6ICd1c2VyU2V0dGluZ3MnLCBhdXRoOiB0cnVlIH1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmlzQWRtaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQWRtaW4oKTtcbiAgICAgICAgICAgIH07Ly9hZGRlZCBieSBNaWd1ZWwgdG8gY2hlY2sgaWYgdGhlIHVzZXIgaXMgYW4gQWRtaW4gdXNlclxuXG4gICAgICAgICAgICBzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UubG9nb3V0KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc2V0VXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHJlbW92ZVVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzZXRVc2VyKCk7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcywgc2V0VXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCByZW1vdmVVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCByZW1vdmVVc2VyKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuZGlyZWN0aXZlKCdyYW5kb0dyZWV0aW5nJywgZnVuY3Rpb24gKFJhbmRvbUdyZWV0aW5ncykge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgICAgICBzY29wZS5ncmVldGluZyA9IFJhbmRvbUdyZWV0aW5ncy5nZXRSYW5kb21HcmVldGluZygpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9