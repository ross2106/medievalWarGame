angular.module('commandCtrl', [])
    .controller('commandController', function ($http, $scope, $routeParams, Socket, Auth, Inventory) {
        Socket.connect();
        $scope.commands = [];
        var json;

        //Grab the logged in user
        var username = '';
        var inventory;
        var getUsername = function () {
            Auth.getUser()
                .then(function (response) {
                    username = response.data.username;
                });
        };
        getUsername();

        var getInventory = function () {
            Inventory.all()
                .then(function (data) {
                    json = data.data;
                    console.log(json);
                    console.log($routeParams.id);
/*                    for (var i = 0; i < json.length; i++) {
                        if (json[i].username === username) {
                            Inventory.get($routeParams.id)
                                .then(function (data) {
                                    inventory = data.data;
                                    console.log(inventory);
                                })
                        }
                    }*/
                });
            //console.log("This is json" + json);
            /*            for(var i = 0; i < json.length(); i++) {
                            var obj = json[i];
                            console.log(obj.id);
                        }*/
            /*            for(var i = 0; i<vm.inventories.length; i++){
                            if(vm.inventories[i].username === username){
                                Inventory.get(vm.inventories[i].id)
                                    .then(function(data){
                                        vm.userInventory = data.data;
                                        console.log(vm.userInventory);
                                    })
                            }
                        }*/
        };
        getInventory();


        /*        Inventory.get()
                    .then(function(data){
                        console.log(data.data);
                    })*/

        /*        var getInventory = function(){
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
