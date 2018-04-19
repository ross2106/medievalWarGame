/*
angular.module('socketService', ['socketFactory', function(socketFactory){
    return socketFactory();
}]);
*/
angular.module('socketFactory', [])
    .factory('Socket', ['socketFactory', function(socketFactory){
    return socketFactory();
}]);
