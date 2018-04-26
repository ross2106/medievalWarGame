angular.module('dashboardCtrl', [])
    .controller('dashboardController', function ($http, $scope, Socket, Auth, Inventory) {
        Socket.connect();
        var vm = this;
        //Set the canvas
        var canvas = document.getElementById('ctx');
        var ctx = canvas.getContext('2d');
        $('#ctx').focus(); //Focus on the canvas from the start
        ctx.font = '15px Arial';
        ctx.fontStyle = 'bold';
        var map = new Image();
        var knight = new Image();

        //User information and inventory information for resource gathering
        vm.username = '';
        vm.inventoryId = '';
        vm.commands = [];
        vm.gold = 0;
        vm.wood = 0;
        vm.food = 0;

        //Socket info for chat messages and users
        $scope.users = [];
        $scope.messages = [];


        //Get the logged in user
        var getUsername = function () {
            Auth.getUser()
                .then(function (response) {
                    vm.username = response.data.username;
                    Socket.emit('add-user', {username: response.data.username});
                });
        };
        getUsername();

        //Get the inventory for that user
        var getInventory = function () {
            Inventory.all()
                .then(function (data) {
                    for (var i = 0; i < data.data.length; i++) {
                        if (data.data[i].username === vm.username) {
                            vm.inventoryId = data.data[i]._id;
                            vm.gold = parseInt(data.data[i].gold);
                            vm.wood = parseInt(data.data[i].wood);
                            vm.food = parseInt(data.data[i].food);
                        }
                    }
                });
        };
        getInventory();

        //Send a message in the chat
        $scope.sendMessage = function (msg) {
            if (msg != null && msg !== '')
                Socket.emit('message', {message: msg});
            $scope.msg = '';
        };

        //Get the online users
        Socket.emit('request-users', {});

        //list of users
        Socket.on('users', function (data) {
            $scope.users = data.users;
        });

        //list of messages in chat
        Socket.on('message', function (data) {
            $scope.messages.push(data);
        });

        //new user connects, add to the list
        Socket.on('add-user', function (data) {
            $scope.users.push(data.username);
            $scope.messages.push({username: data.username, message: 'has entered the channel'});
        });

        //user disconnects, remove from lists
        Socket.on('remove-user', function (data) {
            $scope.users.splice($scope.users.indexOf(data.username), 1);
            $scope.messages.push({username: data.username, message: 'has left the channel'});
        });

        //When somebody navigates off the page
        $scope.$on('$locationChangeStart', function (event) {
            Socket.disconnect(true);
        });

        //Focus click for the canvas
        vm.focus = function (event) {
            event.target.focus();
        };

        //Every time a user moves, they are drawn on the map
        Socket.on('newPositions', function (data) {
            ctx.clearRect(0, 0, 500, 500);
            drawMap();
            for (var i = 0; i < data.length; i++) {
                ctx.fillText(data[i].username, data[i].x, data[i].y);
                ctx.drawImage(knight, data[i].x - 30, data[i].y - 20, 100, 100);
            }
        });

        //Draw the background for the canvas
        var drawMap = function () {
            ctx.drawImage(map, 0, 0);
        };
        knight.src = "/assets/img/knight.png";
        map.src = "/assets/img/Grass.png";

        //If a user presses down a key
        vm.onkeydown = function (event) {
            if (event.keyCode === 68)    //d
                Socket.emit('keyPress', {inputId: 'right', state: true});
            else if (event.keyCode === 83)   //s
                Socket.emit('keyPress', {inputId: 'down', state: true});
            else if (event.keyCode === 65) //a
                Socket.emit('keyPress', {inputId: 'left', state: true});
            else if (event.keyCode === 87) // w
                Socket.emit('keyPress', {inputId: 'up', state: true});
        };

        //If a user lets go of the key
        vm.onkeyup = function (event) {
            if (event.keyCode === 68)    //d
                Socket.emit('keyPress', {inputId: 'right', state: false});
            else if (event.keyCode === 83)   //s
                Socket.emit('keyPress', {inputId: 'down', state: false});
            else if (event.keyCode === 65) //a
                Socket.emit('keyPress', {inputId: 'left', state: false});
            else if (event.keyCode === 87) // w
                Socket.emit('keyPress', {inputId: 'up', state: false});
        };

        //Called whenever the user clicks the mine gold button
        vm.mineGold = function () {
            var random = Math.floor(Math.random() * 100) + 1; //Random amount of gold found
            var chance = Math.floor(Math.random() * 50) + 1; //Random chance of finding gold
            if (chance > 35) { //Gold is rarest
                vm.commands.push('You mined ' + random + ' gold!');
                vm.command = '';
                console.log(vm.commands);
                if (vm.inventoryId !== '') {
                    Inventory.update(vm.inventoryId, {
                        gold: vm.gold + random //Update the inventory
                    });
                    vm.gold += random;
                } else {
                    Inventory.create({ //Create the inventory if they don't have one yet
                        username: vm.username,
                        gold: random,
                        food: 0,
                        wood: 0
                    });
                    getInventory(); //update it
                }
            } else {
                vm.commands.push('Your villagers are searching for gold...');
                vm.command = '';
            }
        };

        //Called whenever somebody clicks the gather food button
        //Same procedure as above
        vm.gatherFood = function () {
            var random = Math.floor(Math.random() * 100) + 1;
            var chance = Math.floor(Math.random() * 50) + 1;
            if (chance > 25) {
                vm.commands.push('You gathered ' + random + ' food!');
                vm.command = '';
                console.log(vm.inventoryId);
                if (vm.inventoryId !== '') {
                    console.log('updating db...');
                    Inventory.update(vm.inventoryId, {
                        food: vm.food + random
                    });
                    vm.food += random;
                } else {
                    Inventory.create({
                        username: vm.username,
                        gold: 0,
                        food: random,
                        wood: 0
                    });
                    getInventory();
                }
            } else {
                vm.commands.push('Your villagers are searching for food...');
                vm.command = '';
            }
        };

        //Called whenever somebody clicks the gather wood button
        //Same procedure as above
        vm.chopWood = function () {
            var random = Math.floor(Math.random() * 100) + 1;
            var chance = Math.floor(Math.random() * 50) + 1;
            if (chance > 25) {
                vm.commands.push('You chopped ' + random + ' wood!');
                vm.command = '';
                if (vm.inventoryId !== '') {
                    Inventory.update(vm.inventoryId, {
                        wood: vm.wood + random
                    });
                    vm.wood += random;
                } else {
                    Inventory.create({
                        username: vm.username,
                        gold: 0,
                        food: 0,
                        wood: random
                    });
                    getInventory();
                }
            } else {
                vm.commands.push('Your villagers are searching for wood...');
                vm.command = '';
            }
        };

    });
