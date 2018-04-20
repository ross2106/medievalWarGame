angular.module('app.routes', ['ngRoute'])

    .config(function ($routeProvider, $locationProvider) {

        $routeProvider

        // route for the home page
            .when('/', {
                templateUrl: 'app/views/pages/home.html'
            })

            // login page
            .when('/login', {
                templateUrl: 'app/views/pages/login.html',
                controller: 'mainController',
                controllerAs: 'login'
            })

            .when('/register', {
                templateUrl: 'app/views/pages/register.html',
                controller: 'mainController',
                controllerAs: 'register'
            })

            .when('/dashboard',{
                templateUrl: 'app/views/pages/loggedIn/dashboard.html',
                controller: 'mainController',
                controllerAs: 'dashboard'
            });

        $locationProvider.html5Mode(true);

    });