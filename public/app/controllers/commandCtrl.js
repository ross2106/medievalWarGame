angular.module('commandCtrl', [])
    .controller('commandController', function ($http, $scope, Socket, Auth) {
        Socket.connect();
        $scope.commands = [];

        //Grab the logged in user
        var username = '';
        var getUsername = function () {
            Auth.getUser()
                .then(function (response) {
                    username = response.data.username;
                });
        };
        getUsername();

        var getInventory =
            $http.get('/api/inventory' + username)
            .then(function(data){
                return data.data;
            });
        console.log(JSON.parse(getInventory));

        /*        var addGold = function(){
                    inventory.$get({
                        'username': getUsername()
                    }, function (err, user) {
                        if(user){
                            var query = {
                                gold: this.gold+(Math.floor(Math.random() * (100+1)))
                            };
                            inventory.update(query, options, callback);
                        } else{
                            var newInventory = new Inventory();
                            newInventory.username = getUsername();
                            newInventory.gold = (Math.floor(Math.random() * (100+1)));
                            newInventory.gold = 0;
                            newInventory.gold = 0;
                            newInventory.save();
                        }
                    });
                };
                var addWood = function(){

                };
                var addFood = function(){

                };*/

        $scope.sendCommand = function (cmd) {
            switch (cmd) {
                case 'mine_gold':
                    Socket.emit('command', {command: cmd});
                    $http.post('/api/inventory', {
                        username: username,
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

    })

    .controller('createInventoryController'), function (Inventory) {
    var vm = this;
    vm.createInventory = function () {
        vm.message = '';
        Inventory.create(vm.userData)
            .success(function (data) {
                vm.userData = {};
                vm.message = data.message;
            })
    }

        .controller('amendInventoryController'), function ($routeParams, Inventory) {
        var vm = this;

        Inventory.get($routeParams.username)
            .then(function (data) {
                vm.inventoryData = data;
            });

        Inventory.update($routeParams.username, vm.userData)
            .then(function (data) {
                vm.userData = {};
                vm.message = data.message;
            })
    }

};
