angular.module('userApp', [
    'ngRoute',
    'ngMaterial',
    'ng',
    'ngAnimate',
    'ngAria',
    'ngMessages',
    'ngAnimate',
    'authService',
    'socketFactory',
    'mainCtrl',
    'userCtrl',
    'leaderboardCtrl',
    'battleCtrl',
    'dashboardCtrl',
    'armouryCtrl',
    'userService',
    'inventoryService',
    'armyService',
    'btford.socket-io',
    'luegg.directives'])
// application configuration to integrate token into requests
    .config(function ($httpProvider, $routeProvider, $locationProvider) {

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

            .when('/dashboard', {
                templateUrl: 'app/views/pages/loggedIn/dashboard.html',
                controller: 'dashboardController',
                controllerAs: 'dashboard'

            })

            .when('/armoury', {
                templateUrl: 'app/views/pages/loggedIn/armoury.html',
                controller: 'armouryController',
                controllerAs: 'armoury'
            })

            .when('/battle', {
                templateUrl: 'app/views/pages/loggedIn/battle.html',
                controller: 'battleController',
                controllerAs: 'battle'
            })

            .when('/leaderboard',{
                templateUrl: 'app/views/pages/loggedIn/leaderboard.html',
                controller: 'leaderboardController',
                controllerAs: 'leaderboard'
            });

        $locationProvider.html5Mode(true);
        // attach our auth interceptor to the http requests
        $httpProvider.interceptors.push('AuthInterceptor');

    });