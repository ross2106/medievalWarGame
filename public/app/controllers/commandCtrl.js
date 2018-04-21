angular.module('commandCtrl', [])
    .controller('commandController', function ($http, $scope, $routeParams, Socket, Auth, Inventory) {
        Socket.connect();
        $scope.commands = [];
        var vm = this;

        //Grab the logged in user
        var username = '';
        var getUsername = function () {
            Auth.getUser()
                .then(function (response) {
                    username = response.data.username;
                });
        };
        getUsername();

        // grab all the inventories at page load
/*        Inventory.all()
            .then(function(data) {

                // when all the users come back, remove the processing variable
                vm.processing = false;

                // bind the users that come back to vm.users
                vm.inventories = data.data;
                console.log(vm.inventories);
                console.log(vm.inventories.username);
                console.log(vm.inventories.data);
            });

/!*        var getInventory = function(){
            if(vm.inventories.username === username){
                Inventory.get(vm.inventories.id)
                    .then(function(response){
                        vm.inventoryData = response.data;
                        console.log(vm.inventoryData);
                    })
            }
        };
        getInventory();*!/*/

        $scope.sendCommand = function (cmd) {
            switch (cmd) {
                case 'mine_gold':
                    Socket.emit('command', {command: cmd});
                        $http.put('/api/inventory/' + username, {
                            gold: Math.floor(Math.random() * 100 + 1),
                            food: 0,
                            wood: 0
                        })
                            .then(function (data) {
                                return data.data;
                            });
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
