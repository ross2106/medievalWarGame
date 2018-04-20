angular.module('chatCtrl', [])
    .controller('chatController', function ($scope, Socket, Auth) {
        Socket.connect();
        $scope.users = [];
        $scope.messages = [];

        var getUsername = function () {
            Auth.getUser()
                .then(function (response) {
                    Socket.emit('add-user', {username: response.data.username});
                });
        };
        getUsername();

        $scope.sendMessage = function (msg) {
            if (msg != null && msg !== '')
                Socket.emit('message', {message: msg});
            $scope.msg = '';
        };

        Socket.emit('request-users', {});

        Socket.on('users', function (data) {
            $scope.users = data.users;
        });

        Socket.on('message', function (data) {
            $scope.messages.push(data);
        });

        Socket.on('add-user', function (data) {
            $scope.users.push(data.username);
            $scope.messages.push({username: data.username, message: 'has entered the channel'});
        });

        Socket.on('remove-user', function (data) {
            $scope.users.splice($scope.users.indexOf(data.username), 1);
            $scope.messages.push({username: data.username, message: 'has left the channel'});
        });

        $scope.$on('$locationChangeStart', function (event) {
            Socket.disconnect(true);
        });
    });
