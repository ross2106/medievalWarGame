angular.module('commandCtrl', [])
    .controller('commandController', function ($scope, Socket, Auth) {
        Socket.connect();
        $scope.commands = [];
        var username = '';
        var getUsername = function () {
            Auth.getUser()
                .then(function (response) {
                    username = response.data.username;
                });
        };
        getUsername();

        $scope.sendCommand = function (cmd) {
            if (cmd != null && cmd !== '') {
                if (cmd = 'mine_gold') {
                    Socket.emit('command', {command: cmd});
                    $scope.cmd = '';
                }
                if (cmd = 'chop_wood') {
                    console.log('chop_wood');
                }
                if (cmd = 'gather_food') {
                    console.log('gather_food');
                }
            }
        };

        Socket.on('command', function (data) {
            $scope.commands.push(data);
        });

    });