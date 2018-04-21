angular.module('commandCtrl', [])
    .controller('commandController', function ($http, $scope, $routeParams, Socket, Auth, Inventory) {
        Socket.connect();
        $scope.commands = [];
        var vm = this;

        //Grab the logged in user
        var username = '';
        var inventoryId = '';
        var gold = 0;
        var wood = 0;
        var food = 0;
        var getUsername = function () {
            Auth.getUser()
                .then(function (response) {
                    username = response.data.username;
                });
        };
        getUsername();

        var getInventoryId = function () {
            Inventory.all()
                .then(function (data) {
                    for (var i = 0; i < data.data.length; i++) {
                        if (data.data[i].username === username) {
                            inventoryId = data.data[i]._id;
                            gold = data.data[i].gold;
                            wood = data.data[i].wood;
                            food = data.data[i].food;
                            console.log(inventoryId);
                        }
                    }
                });
        };
        getInventoryId();

        $scope.sendCommand = function (cmd) {
            switch (cmd) {
                case 'mine_gold':
                    Socket.emit('command', {command: cmd});
                    Inventory.get(inventoryId)
                        .then(function (res) {
                                if (res) {
                                    Inventory.update(username, {
                                        gold: gold + Math.floor(Math.random() * 100 + 1)
                                    })
                                        .then(function (data) {
                                            return data.data;
                                        });
                                } else {
                                    Inventory.create({
                                        username: username,
                                        gold: Math.floor(Math.random() * 100 + 1),
                                        food: 0,
                                        wood: 0
                                    })
                                        .then(function (data) {
                                            return data.data;
                                        });
                                }
                            }
                        );
                    break;
                case 'chop_wood':
                    Socket.emit('command', {command: cmd});
                    $http.post('/api/inventory', {
                        username: getUsername(),
                        gold: 0,
                        food: 0,
                        wood: Math.floor(Math.random() * 100 + 1)
                    })
                        .then(function (data) {
                            return data.data;
                        });
                    break;
                case 'gather_food':
                    Socket.emit('command', {command: cmd});
                    $http.post('/api/inventory', {
                        username: getUsername(),
                        gold: 0,
                        food: Math.floor(Math.random() * 100 + 1),
                        wood: 0
                    })
                        .then(function (data) {
                            return data.data;
                        });
                    break;
            }
            $scope.cmd = '';
        };

        Socket.on('command', function (data) {
            $scope.commands.push(data);
        });

    });
