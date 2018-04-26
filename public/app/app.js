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
    .config(function ($httpProvider, $routeProvider, $locationProvider) {

        $routeProvider

            //Route for main page
            .when('/', {
                templateUrl: 'app/views/pages/home.html'
            })

            //Route for login page
            .when('/login', {
                templateUrl: 'app/views/pages/login.html',
                controller: 'mainController',
                controllerAs: 'login'
            })

            //Route for registration page
            .when('/register', {
                templateUrl: 'app/views/pages/register.html',
                controller: 'mainController',
                controllerAs: 'register'
            })

            //Route for home base page
            .when('/dashboard', {
                templateUrl: 'app/views/pages/loggedIn/dashboard.html',
                controller: 'dashboardController',
                controllerAs: 'dashboard'

            })

            //Route for armoury
            .when('/armoury', {
                templateUrl: 'app/views/pages/loggedIn/armoury.html',
                controller: 'armouryController',
                controllerAs: 'armoury'
            })

            //Route for battle page
            .when('/battle', {
                templateUrl: 'app/views/pages/loggedIn/battle.html',
                controller: 'battleController',
                controllerAs: 'battle'
            })

            //Route for leaderboard page
            .when('/leaderboard',{
                templateUrl: 'app/views/pages/loggedIn/leaderboard.html',
                controller: 'leaderboardController',
                controllerAs: 'leaderboard'
            });

        // attach our location provider
        $locationProvider.html5Mode(true);
        // attach our auth interceptor to the http requests
        $httpProvider.interceptors.push('AuthInterceptor');
    });