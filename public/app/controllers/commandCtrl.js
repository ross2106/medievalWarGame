angular.module('commandCtrl', [])
    .controller('commandController', function ($http, $scope, Socket, Auth) {
        Socket.connect();
        $scope.commands = [];
        //var inventory = $scope.inventory = Inventory.$query();

        //var Inventory = exports.Inventory;

        var username = '';
        var getUsername = function () {
            Auth.getUser()
                .then(function (response) {
                    username = response.data.username;
                });
        };
        getUsername();

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
                    //addGold();
                    break;
                case 'chop_wood':
                    Socket.emit('command', {command: cmd});
                    break;
                case 'gather_food':
                    Socket.emit('command', {command: cmd});
                    break;
            }
            $scope.cmd = '';
        };

        Socket.on('command', function (data) {
            $scope.commands.push(data);
        });

    });