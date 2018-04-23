angular.module('battleCtrl', [])
    .controller('battleController', function ($http, $scope, $mdDialog, Socket, Auth, Inventory, Army, $location) {
        //Connect the socket
        Socket.connect();
        var vm = this;

        //User variables
        vm.username = ''; //Logged in user
        $scope.users = [];
        $scope.messages = [];

        //User army variables
        vm.userHasArmy = false;
        vm.userArmy = '';
        vm.armyId = '';
        vm.infantry = 0;
        vm.archers = 0;
        vm.cavalry = 0;
        vm.userAttack = 0;
        vm.userWinCount = 0;
        vm.userLevel = 0;

        //Information about the user being challenged
        $scope.challenge = null;
        vm.challengeHasArmy = false;
        vm.challengeArmy = '';
        vm.challengeArmyId = '';
        vm.challengeUser = '';
        vm.challengeInfantry = 0;
        vm.challengeArchers = 0;
        vm.challengeCavalry = 0;
        vm.challengeAttack = 0;
        vm.challengeWinCount = 0;
        vm.challengeLevel = 0;

        vm.armies = [];

        //Get the username of the person logged in
        var getUsername = function () {
            Auth.getUser()
                .then(function (response) {
                    vm.username = response.data.username;
                    Socket.emit('add-user', {username: response.data.username});
                });
        };
        getUsername();

        //Get an army given a username
        vm.getArmy = function (username) {
            Army.all()
                .then(function (data) {
                    for (var i = 0; i < data.data.length; i++) {
                        vm.armies.push(data.data[i]);
                        if (data.data[i].username === username) {
                            vm.armyId = data.data[i]._id;
                            vm.infantry = parseInt(data.data[i].infantry);
                            vm.cavalry = parseInt(data.data[i].cavalry);
                            vm.archers = parseInt(data.data[i].archers);
                            vm.userLevel = parseInt(data.data[i].level);
                        }
                    }
                });
        };
        vm.getArmy(vm.username);

        //Get all of the armies
        vm.getAllArmies = function () {
            Army.all()
                .then(function (data) {
                    for(var i = 0; i < data.length; i++){
                        vm.armies.push(data.data[i]);
                    }
                });
        };
        vm.getAllArmies();

        vm.resetArmies = function () {
            //User army variables
            vm.userHasArmy = false;
            vm.userArmy = '';
            vm.armyId = '';
            vm.infantry = 0;
            vm.archers = 0;
            vm.cavalry = 0;
            vm.userAttack = 0;
            vm.userWinCount = 0;
            vm.userLevel = 0;

            //Information about the user being challenged
            $scope.challenge = null;
            vm.challengeHasArmy = false;
            vm.challengeArmy = '';
            vm.challengeArmyId = '';
            vm.challengeUser = '';
            vm.challengeInfantry = 0;
            vm.challengeArchers = 0;
            vm.challengeCavalry = 0;
            vm.challengeAttack = 0;
            vm.challengeWinCount = 0;
            vm.challengeLevel = 0;
        };

        $scope.challengeRequest = function (index) {
            $scope.getChallenger(index);
        };

        //When somebody is challenged, get the details about the person being challenged
        $scope.getChallenger = function (index) {
            console.log(vm.armies);
            $scope.challenge = index; //The person who is being challenged
            vm.challengeUser = $scope.users[$scope.challenge];
            if ($scope.users[$scope.challenge] === vm.username) {
                Socket.emit('challenge', {message: 'You cannot challenge yourself!'}); //Make sure the logged in user is not trying to challenge themself
            }
            if ($scope.users[$scope.challenge] !== vm.username) {
                for (var i = 0; i < vm.armies.length; i++) {
                    //Make sure the person being challenged actually has an army
                    if (vm.armies[i].username === vm.challengeUser) {
                        vm.challengeHasArmy = true;
                    }
                    if (vm.armies[i].username === vm.username) {
                        vm.userHasArmy = true;
                    }
                }
                //If they have an army, set up the armies for battle
                if (vm.challengeHasArmy && vm.userHasArmy) {
                    vm.setArmies();
                }
                //If they dont have an army, then display a message to the logged in user
                if (!vm.challengeHasArmy) {
                    Socket.emit('challenge', {message: 'This player does not currently have an army!'});
                }
                if (!vm.userHasArmy) {
                    Socket.emit('challenge', {message: 'You need to make an army to do this!'});
                }
            }
        };


        //Set up the armies for battle
        //This function takes the units from each army and gives them an attack score
        vm.setArmies = function () {
            //The person who is logged in
            vm.userAttack = 0;
            //The person being challenged
            vm.challengeAttack = 0;
            //Loop through the armies
            for (var i = 0; i < vm.armies.length; i++) {
                //The person being challenged
                if (vm.armies[i].username === vm.challengeUser) {
                    //Set the army for the person being challenged
                    vm.challengeArmy = vm.armies[i];
                    vm.challengeArmyId = vm.armies[i]._id;
                    vm.challengeWinCount = vm.armies[i].winCount;
                    vm.challengeLevel = vm.armies[i].level;
                    //Set the units for that army
                    vm.challengeInfantry = vm.armies[i].infantry;
                    vm.challengeCavalry = vm.armies[i].cavalry;
                    vm.challengeArchers = vm.armies[i].archers;
                    //Set the attack points based off of the default attack points and the level of the user
                    //Infantry default is 2 attack points
                    //Cavalry default is 5 attack points
                    //Archer default is 1 attack point
                    vm.challengeAttack += vm.armies[i].infantry * (3 + vm.challengeLevel);
                    vm.challengeAttack += vm.armies[i].cavalry * (5 + vm.challengeLevel);
                    vm.challengeAttack += vm.armies[i].archers * (2 + vm.challengeLevel);
                }
                //The logged in user
                if (vm.armies[i].username === vm.username) {
                    //Same process as above
                    vm.userArmy = vm.armies[i];
                    vm.armyId = vm.armies[i]._id;
                    vm.userWinCount = vm.armies[i].winCount;
                    vm.userLevel = vm.armies[i].level;
                    vm.infantry = vm.armies[i].infantry;
                    vm.cavalry = vm.armies[i].cavalry;
                    vm.archers = vm.armies[i].archers;
                    vm.userAttack += vm.armies[i].infantry * (3 + vm.userLevel);
                    vm.userAttack += vm.armies[i].cavalry * (5 + vm.userLevel);
                    vm.userAttack += vm.armies[i].archers * (2 + vm.userLevel);
                }
            }
            //Take the difference between the two users attack point
            var diff = Math.abs(vm.userAttack - vm.challengeAttack);
            //If the user has a higher attack
            if (vm.userAttack > vm.challengeAttack) {
                //Give a new value to the user/challenge attack. User has a chance of getting a higher value so more likely to win the game
                vm.userAttack = Math.floor(Math.random() * (100 + diff)) + 1;
                vm.challengeAttack = Math.floor(Math.random() * (100 - diff)) + 1;
            }
            //If the person being challenged has a higher attack
            if (vm.challengeAttack > vm.userAttack) {
                //Give a new value to the user/challenge attack. The person being challenged has a chance of getting a higher value so more likely to win the game
                vm.challengeAttack = Math.floor(Math.random() * (100 + diff)) + 1;
                vm.userAttack = Math.floor(Math.random() * (100 - diff)) + 1;
            }
            //If the two players have the same attack score
            if (vm.challengeAttack === vm.userAttack) {
                //Scores remain the same
                vm.userAttack = Math.floor(Math.random() * 100) + 1;
                vm.challegeAttack = Math.floor(Math.random() * 100) + 1;
            }
            //Attack scores are set... Start the battle!
            vm.doBattle();
        };

        //Function called to start a battle
        vm.doBattle = function () {
            var challengedUnitsLost = 0;
            var challengedPercentLost = 0;
            var challengedInfantryLost = 0;
            var challengedCavalryLost = 0;
            var challengedArchersLost = 0;
            var userInfantryLost = 0;
            var userCavalryLost = 0;
            var userArchersLost = 0;
            if (vm.userAttack > vm.challengeAttack) {
                //Logged in user has won, increase their win count
                vm.userWinCount = vm.userWinCount + 1;
                //Increase their level if they've reached a certain win count
                switch (vm.userWinCount) {
                    case 5:
                        vm.userLevel++;
                        break;
                    case 10:
                        vm.userLevel++;
                        break;
                    case 15:
                        vm.userLevel++;
                        break;
                    case 20:
                        vm.userLevel++;
                        break;
                }
                //Challenge attack is going to lose.
                //They will either lost half their army or their whole army
                //Coin toss
                challengedUnitsLost = Math.floor(Math.random() * 3) + 1;
                challengedPercentLost = 0;
                switch (challengedUnitsLost) {
                    case 1:
                        //Half their forces were destroyed
                        challengedPercentLost = 50;
                        Socket.emit('announcement', {message: vm.username + ' ambushed ' + vm.challengeUser + ' and destroyed half their forces!'});
                        break;
                    case 2:
                        //Half their forces were destroyed
                        challengedPercentLost = 75;
                        Socket.emit('announcement', {message: vm.username + ' ambushed ' + vm.challengeUser + ' and destroyed the majority of their forces!'});
                        break;
                    case 3:
                        //Their whole army was wiped out
                        challengedPercentLost = 100;
                        Socket.emit('announcement', {message: vm.username + ' ambushed ' + vm.challengeUser + ' and destroyed all their forces!'});
                        break;
                }
                //The person logged in will also lose some units in the battle
                //This will also be based on a coin toss with a much smaller chunk of army lost
                var userUnitsLost = Math.floor(Math.random() * 4) + 1;
                var userPercentLost = 0;
                switch (userUnitsLost) {
                    case 1:
                        userPercentLost = 10;
                        Socket.emit('announcement', {message: vm.username + ' lost ' + userPercentLost + '% of their forces in the battle.'});
                        break;
                    case 2:
                        userPercentLost = 20;
                        Socket.emit('announcement', {message: vm.username + ' lost ' + userPercentLost + '% of their forces in the battle.'});
                        break;
                    case 3:
                        userPercentLost = 30;
                        Socket.emit('announcement', {message: vm.username + ' lost ' + userPercentLost + '% of their forces in the battle.'});
                        break;
                    case 4:
                        userPercentLost = 40;
                        Socket.emit('announcement', {message: vm.username + ' lost ' + userPercentLost + '% of their forces in the battle.'});
                        break;
                }
                //Based on how much of their army was lost, change reduce the size of their army
                //Person who was challenged
                challengedInfantryLost = Math.round((vm.challengeInfantry / 100) * challengedPercentLost);
                challengedCavalryLost = Math.round((vm.challengeCavalry / 100) * challengedPercentLost);
                challengedArchersLost = Math.round((vm.challengeArchers / 100) * challengedPercentLost);
                vm.challengeInfantry = vm.challengeInfantry - challengedInfantryLost;
                vm.challengeCavalry = vm.challengeCavalry - challengedCavalryLost;
                vm.challengeArchers = vm.challengeArchers - challengedArchersLost;
                //The logged in user
                userInfantryLost = Math.round((vm.infantry / 100) * userPercentLost);
                userCavalryLost = Math.round((vm.cavalry / 100) * userPercentLost);
                userArchersLost = Math.round((vm.archers / 100) * userPercentLost);
                vm.infantry = vm.infantry - userInfantryLost;
                vm.cavalry = vm.cavalry - userCavalryLost;
                vm.archers = vm.archers - userArchersLost;
                //If their whole army was destroyed, delete from DB and from variables
                if (challengedPercentLost === 100) {
                    Army.delete(vm.challengeArmyId)
                        .then(function () {
                            for (var i = 0; i < vm.armies.length; i++) {
                                if (vm.armies[i].username === vm.challengeUser) {
                                    vm.armies.splice(vm.armies.indexOf(vm.challengeUser), 1);
                                    vm.challengeHasArmy = false;
                                }
                            }
                        });
                }
                //Otherwise, update their army based on the units lost
                else {
                    //This user was challenged so their wincount isn't affected
                    Army.update(vm.challengeArmyId, {
                        infantry: vm.challengeInfantry,
                        cavalry: vm.challengeCavalry,
                        archers: vm.challengeArchers
                    });
                    //This user challenged and won, so their wincount increases
                    Army.update(vm.armyId, {
                        infantry: vm.infantry,
                        cavalry: vm.cavalry,
                        archers: vm.archers,
                        winCount: vm.userWinCount
                    });
                }
            }
            //If the opponents manages to get a higher attack score
            else {
                //The person being challenged won, increase their win count
                vm.challengeWinCount++;
                //The logged in user lost, decrease their wincount
                vm.userWinCount--;
                if (vm.userWinCount < 0) {
                    vm.userWinCount = 0;
                }
                //Increase the person who was challenged wincount if they've reached a certain number
                switch (vm.challengeWinCount) {
                    case 5:
                        vm.challengeLevel++;
                        break;
                    case 10:
                        vm.challengeLevel++;
                        break;
                    case 15:
                        vm.challengeLevel++;
                        break;
                    case 20:
                        vm.challengeLevel++;
                        break;
                }
                //Decrease the losers wincount if they've dropped to a different number
                switch (vm.userWinCount) {
                    case 0:
                        vm.userLevel = 1;
                        break;
                    case 4:
                        vm.userLevel--;
                        break;
                    case 9:
                        vm.userLevel--;
                        break;
                    case 14:
                        vm.userLevel--;
                        break;
                    case 19:
                        vm.userLevel--;
                        break;
                }
                //The logged in user has lost the fight
                //They will either lose half their army or their whole army
                //Coin toss
                userUnitsLost = Math.floor(Math.random() * 3) + 1;
                userPercentLost = 0;
                switch (userUnitsLost) {
                    case 1:
                        //Half their forces were destroyed
                        userPercentLost = 50;
                        Socket.emit('announcement', {message: vm.username + ' ambushed ' + vm.challengeUser + ' but it failed! Half of their forces were wiped out.'});
                        break;
                    case 2:
                        //Half their forces were destroyed
                        userPercentLost = 75;
                        Socket.emit('announcement', {message: vm.username + ' ambushed ' + vm.challengeUser + ' but it failed! The majority of their forces were wiped out!'});
                        break;
                    case 3:
                        //Their whole army was wiped out
                        userPercentLost = 100;
                        Socket.emit('announcement', {message: vm.username + ' ambushed ' + vm.challengeUser + ' but it failed! Their entire army was wiped out!'});
                        break;
                }
                //The person who was challenged will also lose some units in the battle
                //This will also be based on a coin toss with a much smaller chunk of army lost
                challengedUnitsLost = Math.floor(Math.random() * 4) + 1;
                challengedPercentLost = 0;
                switch (challengedUnitsLost) {
                    case 1:
                        challengedPercentLost = 10;
                        Socket.emit('announcement', {message: vm.challengeUser + ' lost ' + challengedPercentLost + '% of their forces in the battle.'});
                        break;
                    case 2:
                        challengedPercentLost = 20;
                        Socket.emit('announcement', {message: vm.challengeUser + ' lost ' + challengedPercentLost + '% of their forces in the battle.'});
                        break;
                    case 3:
                        challengedPercentLost = 30;
                        Socket.emit('announcement', {message: vm.challengeUser + ' lost ' + challengedPercentLost + '% of their forces in the battle.'});
                        break;
                    case 4:
                        challengedPercentLost = 40;
                        Socket.emit('announcement', {message: vm.challengeUser + ' lost ' + challengedPercentLost + '% of their forces in the battle.'});
                        break;
                }
                //Based on how much of their army was lost, reduce the size of their army
                //Person who was challenged
                challengedInfantryLost = Math.round((vm.challengeInfantry / 100) * challengedPercentLost);
                challengedCavalryLost = Math.round((vm.challengeCavalry / 100) * challengedPercentLost);
                challengedArchersLost = Math.round((vm.challengeArchers / 100) * challengedPercentLost);
                vm.challengeInfantry = vm.challengeInfantry - challengedInfantryLost;
                vm.challengeCavalry = vm.challengeCavalry - challengedCavalryLost;
                vm.challengeArchers = vm.challengeArchers - challengedArchersLost;
                //The logged in user
                userInfantryLost = Math.round((vm.infantry / 100) * userPercentLost);
                userCavalryLost = Math.round((vm.cavalry / 100) * userPercentLost);
                userArchersLost = Math.round((vm.archers / 100) * userPercentLost);
                vm.infantry = vm.infantry - userInfantryLost;
                vm.cavalry = vm.cavalry - userCavalryLost;
                vm.archers = vm.archers - userArchersLost;
                //If their whole army was destroyed, delete from DB and from variables
                if (userPercentLost === 100) {
                    Army.delete(vm.userArmy._id)
                        .then(function () {
                            for (var i = 0; i < vm.armies.length; i++) {
                                if (vm.armies[i].username === vm.username) {
                                    vm.armies.splice(vm.armies.indexOf(vm.username), 1);
                                    vm.userHasArmy = false;
                                }
                            }
                            $location.path("/armoury");
                            alert('Your entire army was destroyed!');
                        });
                }
                //Otherwise, update their army based on the units lost
                else {
                    //This user was challenged and won, so their wincount increases
                    Army.update(vm.challengeArmyId, {
                        infantry: vm.challengeInfantry,
                        cavalry: vm.challengeCavalry,
                        archers: vm.challengeArchers,
                        winCount: vm.challengeWinCount,
                        level: vm.challengeLevel
                    });
                    //This user challenged and lost, so their wincount decreases
                    if (vm.userLevel < 0) {
                        vm.userLevel = 0;
                    }
                    Army.update(vm.armyId, {
                        infantry: vm.infantry,
                        cavalry: vm.cavalry,
                        archers: vm.archers,
                        winCount: vm.userWinCount,
                        level: vm.userLevel
                    })
                }
            }
        };

        $scope.sendMessage = function (msg) {
            if (msg != null && msg !== '')
                Socket.emit('message', {message: msg});
            $scope.msg = '';
        };

        Socket.emit('request-users', {});

        Socket.on('users', function (data) {
            $scope.users = data.users;
        });

        Socket.on('announcement', function (data) {
            $scope.messages.push(data);
        });

        Socket.on('challenge', function (data) {
            $scope.messages.push(data);
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
    })
;