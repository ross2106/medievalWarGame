angular.module('armouryCtrl', [])
    .controller('armouryController', function ($http, Auth, Army, Inventory) {
        var vm = this;
        vm.username = '';

        vm.armyId = '';
        vm.infantry = 0;
        vm.archers = 0;
        vm.cavalry = 0;

        vm.inventoryId = '';
        vm.gold = 0;
        vm.wood = 0;
        vm.food = 0;

        vm.infantryError = '';
        vm.cavalryError = '';
        vm.archerError = '';

        var getUsername = function () {
            Auth.getUser()
                .then(function (response) {
                    vm.username = response.data.username;
                });
        };
        getUsername();

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

        vm.buyInfantry = function () {
            vm.infantryError = '';
            if (vm.gold >= 120 && vm.food >= 150) {
                if (vm.armyId !== '') {
                    Army.update(vm.armyId, {
                        infantry: vm.infantry + 1
                    });
                    Inventory.update(vm.inventoryId, {
                        gold: vm.gold - 120,
                        food: vm.food - 150
                    });
                    vm.gold -= 120;
                    vm.food -= 150;
                    vm.infantry += 1;
                } else {
                    Army.create({
                        username: vm.username,
                        infantry: 1,
                        archers: 0,
                        cavalry: 0,
                        level: 1,
                        winCount: 0
                    });
                    Inventory.update(vm.inventoryId, {
                        gold: vm.gold - 120,
                        food: vm.food - 150
                    });
                    vm.gold -= 120;
                    vm.food -= 150;
                    getInventory();
                    getArmy();
                }
            } else {
                vm.infantryError = 'You do not have the resources to purchase this unit!';
            }
        };
        vm.buyCavalry = function () {
            vm.cavalryError = '';
            if (vm.gold >= 300 && vm.food >= 300) {
                if (vm.armyId !== '') {
                    Army.update(vm.armyId, {
                        cavalry: vm.cavalry + 1
                    });
                    Inventory.update(vm.inventoryId, {
                        gold: vm.gold - 200,
                        food: vm.food - 300
                    });
                    vm.gold -= 200;
                    vm.food -= 300;
                    vm.cavalry += 1;
                } else {
                    Army.create({
                        username: vm.username,
                        infantry: 0,
                        archers: 0,
                        cavalry: 1,
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
            vm.archerError = '';
            if (vm.gold >= 100 && vm.food >= 100 && vm.wood >= 200) {
                if (vm.armyId !== '') {
                    Army.update(vm.armyId, {
                        archers: vm.archers + 1
                    });
                    Inventory.update(vm.inventoryId, {
                        gold: vm.gold - 100,
                        food: vm.food - 100,
                        wood: vm.wood - 200
                    });
                    vm.gold -= 100;
                    vm.food -= 100;
                    vm.wood -= 200;
                    vm.archers += 1;
                } else {
                    Army.create({
                        username: vm.username,
                        infantry: 0,
                        archers: 1,
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