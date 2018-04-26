angular.module('socketFactory', [])
    .factory('Socket', ['socketFactory', function(socketFactory){
        //For the chat sockets
    return socketFactory();
}]);
