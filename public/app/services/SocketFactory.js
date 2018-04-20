angular.module('socketFactory', [])
    .factory('Socket', ['socketFactory', function(socketFactory){
    return socketFactory();
}]);
