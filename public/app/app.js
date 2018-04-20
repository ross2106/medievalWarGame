angular.module('userApp', [
    'ngAnimate',
    'app.routes',
    'authService',
    'socketFactory',
    'mainCtrl',
    'commandCtrl',
    'userCtrl',
    'chatCtrl',
    'gameCtrl',
    'userService',
    'btford.socket-io'])

  // application configuration to integrate token into requests
  .config(function($httpProvider) {

    // attach our auth interceptor to the http requests
    $httpProvider.interceptors.push('AuthInterceptor');

  });