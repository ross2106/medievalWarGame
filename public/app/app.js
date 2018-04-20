angular.module('userApp', [
    'ngAnimate',
    'app.routes',
    'authService',
    'socketFactory',
    'mainCtrl',
    'userCtrl',
    'chatCtrl',
    'gameCtrl',
    'commandCtrl',
    'userService',
    'btford.socket-io'])

  // application configuration to integrate token into requests
  .config(function($httpProvider) {

    // attach our auth interceptor to the http requests
    $httpProvider.interceptors.push('AuthInterceptor');

  });