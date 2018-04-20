angular.module('commandCtrl', [])
    .controller('commandController', function ($scope, Socket, Auth) {
        Socket.connect();
        var username = '';
        var getUsername = function () {
            Auth.getUser()
                .then(function (response) {
                    username = response.data.username;
                });
        };
        getUsername();

        $scope.sendCommand = function (command) {
            if (command != null && command !== '') {
                if (command = 'mine_gold') {

                }
                if (command = 'chop_wood') {

                }
                if (command = 'gather_food') {

                }
            }

            Socket.emit('message', {message: command});
            $scope.msg = '';
        };


    });