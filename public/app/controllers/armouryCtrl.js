angular.module('armouryCtrl', [])
    .controller('armouryController', function ($http, Auth, Army, Inventory) {
        var vm = this;
        vm.username = '';

        //Variables for the users army
        vm.armyId = '';
        vm.infantry = 0;
        vm.archers = 0;
        vm.cavalry = 0;

        //Variables for the users inventory
        vm.inventoryId = '';
        vm.gold = 0;
        vm.wood = 0;
        vm.food = 0;

        //Error messages
        vm.infantryError = '';
        vm.cavalryError = '';
        vm.archerError = '';

        //Get the logged in user
        var getUsername = function () {
            Auth.getUser()
                .then(function (response) {
                    vm.username = response.data.username;
                });
        };
        getUsername();

        //Get the army of the logged in user
        var getArmy = function () {
            Army.all()
                .then(function (data) {
                    for (var i = 0; i < data.data.length; i++) {
                        if (data.data[i].username === vm.username) {
                            vm.armyId = data.data[i]._id;
                            vm.infantry = parseInt(data.data[i].infantry);
                            vm.cavalry = parseInt(data.data[i].cavalry);
                            vm.archers = parseInt(data.data[i].archers);
                        }
                    }
                });
        };
        getArmy();

        //Get the inventory of the logged in user
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

        //Called when a user buys infantry
        vm.buyInfantry = function () {
            vm.cavalryError = '';
            vm.infantryError = '';
            vm.archerError = '';
            if (vm.gold >= 120 && vm.food >= 150) { //If they can afford it
                if (vm.armyId !== '') {
                    Army.update(vm.armyId, {
                        infantry: vm.infantry + 10 //Update their troops
                    });
                    Inventory.update(vm.inventoryId, {
                        gold: vm.gold - 120, //Take away their resources
                        food: vm.food - 150
                    });
                    vm.gold -= 120;
                    vm.food -= 150; //local variables
                    vm.infantry += 10;
                } else {
                    Army.create({ //If they can afford it but don't have an army yet, create one
                        username: vm.username,
                        infantry: 10,
                        archers: 0,
                        cavalry: 0,
                        level: 1,
                        winCount: 0
                    });
                    Inventory.update(vm.inventoryId, {
                        gold: vm.gold - 120,
                        food: vm.food - 150 //Take away their resources
                    });
                    vm.gold -= 120;
                    vm.food -= 150;
                    getInventory(); //Update the values
                    getArmy();
                }
            } else {
                vm.infantryError = 'You do not have the resources to purchase this unit!'; //Error message
            }
        };
        vm.buyCavalry = function () {
            vm.cavalryError = '';
            vm.infantryError = '';
            vm.archerError = '';
            if (vm.gold >= 300 && vm.food >= 300) {
                if (vm.armyId !== '') {
                    Army.update(vm.armyId, {
                        cavalry: vm.cavalry + 10
                    });
                    Inventory.update(vm.inventoryId, {
                        gold: vm.gold - 200,
                        food: vm.food - 300
                    });
                    vm.gold -= 200;
                    vm.food -= 300;
                    vm.cavalry += 10;
                } else {
                    Army.create({
                        username: vm.username,
                        infantry: 0,
                        archers: 0,
                        cavalry: 10,
                        level: 1,
                        winCount: 0
                    });
                    Inventory.update(vm.inventoryId, {
                        gold: vm.gold - 200,
                        food: vm.food - 300
                    });
                    vm.gold -= 200;
                    vm.food -= 300;
                    getInventory();
                    getArmy();
                }
            } else {
                vm.cavalryError = 'You do not have the resources to purchase this unit!';
            }
        };
        vm.buyArchers = function () {
            vm.cavalryError = '';
            vm.infantryError = '';
            vm.archerError = '';
            if (vm.gold >= 100 && vm.food >= 100 && vm.wood >= 200) {
                if (vm.armyId !== '') {
                    Army.update(vm.armyId, {
                        archers: vm.archers + 10
                    });
                    Inventory.update(vm.inventoryId, {
                        gold: vm.gold - 100,
                        food: vm.food - 100,
                        wood: vm.wood - 200
                    });
                    vm.gold -= 100;
                    vm.food -= 100;
                    vm.wood -= 200;
                    vm.archers += 10;
                } else {
                    Army.create({
                        username: vm.username,
                        infantry: 0,
                        archers: 10,
                        cavalry: 0,
                        level: 1,
                        winCount: 0
                    });
                    Inventory.update(vm.inventoryId, {
                        gold: vm.gold - 100,
                        food: vm.food - 100,
                        wood: vm.wood - 200
                    });
                    vm.gold -= 100;
                    vm.food -= 100;
                    vm.wood -= 200;
                    getInventory();
                    getArmy();
                }
            } else {
                vm.archerError = 'You do not have the resources to purchase this unit!';
            }
        };
    });