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
                switch (cmd) {
                    case 'mine_gold':
                        Socket.emit('command', {command: cmd});
                        $scope.cmd = '';
                        //console.log('mine_gold');
                        break;
                    case 'chop_wood':
                        console.log('chop_wood');
                        break;
                    case 'gather_food':
                        console.log('gather_food');
                        break;
                }
            }
        };

        Socket.on('command', function (data) {
            $scope.commands.push(data);
        });

    });