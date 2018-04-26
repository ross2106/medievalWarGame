angular.module('battleCtrl', [])
    .controller('battleController', function ($http, $scope, Socket, Auth, Inventory, Army, $location) {
        //Connect the socket
        Socket.connect();
        var vm = this;

        $('[data-toggle="tooltip"]').tooltip();

        //User variables
        vm.username = ''; //Logged in user
        $scope.users = [];
        $scope.messages = [];

        vm.armies = [];

        //User who is being challenged
        vm.challengedUserIndex = '';
        vm.challengedUser = '';
        vm.challengedArmy = '';
        vm.challengedAttack = 0;

        //Logged in user
        vm.username = '';
        vm.userArmy = '';
        vm.userAttack = 0;

        //Get the username of the person logged in
        vm.getUsername = function () {
            Auth.getUser()
                .then(function (response) {
                    vm.username = response.data.username;
                    Socket.emit('add-user', {username: response.data.username});
                });
        };
        vm.getUsername();

        vm.getArmies = function (callback) {
            Army.all()
                .then(function (data) {
                    vm.armies = data.data;
                    for (var i = 0; i < vm.armies.length; i++) {
                        if (vm.armies[i].username === vm.username) {
                            vm.userArmy = data.data[i];
                        } else if (vm.armies[i].username === vm.challengedUser) {
                            vm.challengedArmy = data.data[i];
                        }
                    }
                    callback();
                });
        };

        vm.getArmy = function (name) {
            var army = '';
            for (var i = 0; i < vm.armies.length; i++) {
                if (vm.armies[i].username === name) {
                    army = vm.armies[i];
                }
            }
            return army;
        };

        $scope.challengeRequest = function (index) {
            vm.challengedUserIndex = index;
            vm.challengedUser = $scope.users[vm.challengedUserIndex];
            vm.getArmies(function () {
                console.log('Finished getting armies...');
                if (vm.challengedUser === vm.username) {
                    Socket.emit('challenge', {message: 'You cannot challenge yourself!'}); //Make sure the logged in user is not trying to challenge themself
                }
                if (vm.challengedUser !== vm.username) {
                    //If both users have an army
                    if (vm.challengedArmy && vm.userArmy) {
                        vm.setArmies();
                    } else {
                        Socket.emit('challenge', {message: 'Both players need an army to battle!'});
                    }
                }
            });
        };

        vm.setArmies = function () {
            //Set the attack level of the person being challenged
            vm.challengedAttack += vm.challengedArmy.infantry * (3 + vm.challengedArmy.level);
            vm.challengedAttack += vm.challengedArmy.cavalry * (5 + vm.challengedArmy.level);
            vm.challengedAttack += vm.challengedArmy.archers * (2 + vm.challengedArmy.level);
            //Set the attack level of the logged in user
            vm.userAttack += vm.userArmy.infantry * (3 + vm.userArmy.level);
            vm.userAttack += vm.userArmy.cavalry * (3 + vm.userArmy.level);
            vm.userAttack += vm.userArmy.archers * (3 + vm.userArmy.level);
            //Take the difference between the two users attack point
            var diff = Math.abs(vm.userAttack - vm.challengedAttack);
            //If the user has a higher attack
            if (vm.userAttack > vm.challengedAttack) {
                //Give a new value to the user/challenge attack. User has a chance of getting a higher value so more likely to win the game
                vm.userAttack = Math.floor(Math.random() * (100 + diff)) + 1;
                vm.challengedAttack = Math.floor(Math.random() * (100 - diff)) + 1;
            }
            //If the person being challenged has a higher attack
            if (vm.challengedAttack > vm.userAttack) {
                //Give a new value to the user/challenge attack. The person being challenged has a chance of getting a higher value so more likely to win the game
                vm.challengedAttack = Math.floor(Math.random() * (100 + diff)) + 1;
                vm.userAttack = Math.floor(Math.random() * (100 - diff)) + 1;
            }
            //If the two players have the same attack score
            if (vm.challengedAttack === vm.userAttack) {
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
            var userUnitsLost = 0;
            var userPercentLost = 0;
            var userInfantryLost = 0;
            var userCavalryLost = 0;
            var userArchersLost = 0;
            if (vm.userAttack > vm.challengedAttack) {
                //Logged in user has won, increase their win count
                console.log('Win count before' + vm.userArmy.winCount);
                vm.userArmy.winCount++;
                console.log('Win count after' + vm.userArmy.winCount);
                //Increase their level if they've reached a certain win count
                switch (vm.userArmy.winCount) {
                    case 5:
                        vm.userArmy.level++;
                        break;
                    case 10:
                        vm.userArmy.level++;
                        break;
                    case 15:
                        vm.userArmy.level++;
                        break;
                    case 20:
                        vm.userArmy.level++;
                        break;
                }
                console.log('New user level...' + vm.userArmy.level);
                //Challenge attack is going to lose.
                //They will either lost half their army or their whole army
                //Coin toss
                challengedUnitsLost = Math.floor(Math.random() * 3) + 1;
                switch (challengedUnitsLost) {
                    case 1:
                        //Half their forces were destroyed
                        challengedPercentLost = 50;
                        Socket.emit('announcement', {message: vm.username + ' ambushed ' + vm.challengedUser + ' and destroyed half their forces!'});
                        break;
                    case 2:
                        //Half their forces were destroyed
                        challengedPercentLost = 75;
                        Socket.emit('announcement', {message: vm.username + ' ambushed ' + vm.challengedUser + ' and destroyed the majority of their forces!'});
                        break;
                    case 3:
                        //Their whole army was wiped out
                        challengedPercentLost = 100;
                        Socket.emit('announcement', {message: vm.username + ' ambushed ' + vm.challengedUser + ' and destroyed all their forces!'});
                        break;
                }
                //The person logged in will also lose some units in the battle
                //This will also be based on a coin toss with a much smaller chunk of army lost
                userUnitsLost = Math.floor(Math.random() * 4) + 1;
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
                challengedInfantryLost = Math.ceil((vm.challengedArmy.infantry / 100) * challengedPercentLost);
                challengedCavalryLost = Math.ceil((vm.challengedArmy.cavalry / 100) * challengedPercentLost);
                challengedArchersLost = Math.ceil((vm.challengedArmy.archers / 100) * challengedPercentLost);
                vm.challengedArmy.infantry -= challengedInfantryLost;
                vm.challengedArmy.cavalry -= challengedCavalryLost;
                vm.challengedArmy.archers -= challengedArchersLost;
                //The logged in user
                userInfantryLost = Math.ceil((vm.userArmy.infantry / 100) * userPercentLost);
                userCavalryLost = Math.ceil((vm.userArmy.cavalry / 100) * userPercentLost);
                userArchersLost = Math.ceil((vm.userArmy.archers / 100) * userPercentLost);
                vm.userArmy.infantry -= userInfantryLost;
                vm.userArmy.cavalry -= userCavalryLost;
                vm.userArmy.archers -= userArchersLost;
                //If their whole army was destroyed, delete from DB and from variables
                if (challengedPercentLost === 100) {
                    Army.delete(vm.challengedArmy._id)
                        .then(function () {
                            vm.challengedArmy = '';
                        });
                    //This user challenged and won, so their win count increases
                    Army.update(vm.userArmy._id, {
                        infantry: vm.userArmy.infantry,
                        cavalry: vm.userArmy.cavalry,
                        archers: vm.userArmy.archers,
                        winCount: vm.userArmy.winCount,
                        level: vm.userArmy.level
                    });
                }
                //Otherwise, update their army based on the units lost
                else {
                    //This user was challenged so their wincount isn't affected
                    Army.update(vm.challengedArmy._id, {
                        infantry: vm.challengedArmy.infantry,
                        cavalry: vm.challengedArmy.cavalry,
                        archers: vm.challengedArmy.archers
                    });
                    //This user challenged and won, so their wincount increases
                    Army.update(vm.userArmy._id, {
                        infantry: vm.userArmy.infantry,
                        cavalry: vm.userArmy.cavalry,
                        archers: vm.userArmy.archers,
                        winCount: vm.userArmy.winCount,
                        level: vm.userArmy.level
                    });
                }
            }
            //If the opponents manages to get a higher attack score
            else {
                //The person being challenged won, increase their win count
                vm.challengedArmy.winCount++;
                //The logged in user lost, decrease their wincount
                vm.userArmy.winCount--;
                if (vm.userArmy.winCount < 0) {
                    vm.userArmy.winCount = 0;
                }
                //Increase the person who was challenged wincount if they've reached a certain number
                switch (vm.challengedArmy.winCount) {
                    case 5:
                        vm.challengedArmy.level++;
                        break;
                    case 10:
                        vm.challengedArmy.level++;
                        break;
                    case 15:
                        vm.challengedArmy.level++;
                        break;
                    case 20:
                        vm.challengedArmy.level++;
                        break;
                }
                //Decrease the losers wincount if they've dropped to a different number
                switch (vm.userArmy.winCount) {
                    case 0:
                        vm.userArmy.level = 1;
                        break;
                    case 4:
                        vm.userArmy.level--;
                        break;
                    case 9:
                        vm.userArmy.level--;
                        break;
                    case 14:
                        vm.userArmy.level--;
                        break;
                    case 19:
                        vm.userArmy.level--;
                        break;
                }
                //The logged in user has lost the fight
                //They will either lose half their army or their whole army
                //Coin toss
                userUnitsLost = Math.floor(Math.random() * 3) + 1;
                switch (userUnitsLost) {
                    case 1:
                        //Half their forces were destroyed
                        userPercentLost = 50;
                        Socket.emit('announcement', {message: vm.username + ' ambushed ' + vm.challengedUser + ' but it failed! Half of their forces were wiped out.'});
                        break;
                    case 2:
                        //Half their forces were destroyed
                        userPercentLost = 75;
                        Socket.emit('announcement', {message: vm.username + ' ambushed ' + vm.challengedUser + ' but it failed! The majority of their forces were wiped out!'});
                        break;
                    case 3:
                        //Their whole army was wiped out
                        userPercentLost = 100;
                        Socket.emit('announcement', {message: vm.username + ' ambushed ' + vm.challengedUser + ' but it failed! Their entire army was wiped out!'});
                        break;
                }
                //The person who was challenged will also lose some units in the battle
                //This will also be based on a coin toss with a much smaller chunk of army lost
                challengedUnitsLost = Math.floor(Math.random() * 4) + 1;
                switch (challengedUnitsLost) {
                    case 1:
                        challengedPercentLost = 10;
                        Socket.emit('announcement', {message: vm.challengedUser + ' lost ' + challengedPercentLost + '% of their forces in the battle.'});
                        break;
                    case 2:
                        challengedPercentLost = 20;
                        Socket.emit('announcement', {message: vm.challengedUser + ' lost ' + challengedPercentLost + '% of their forces in the battle.'});
                        break;
                    case 3:
                        challengedPercentLost = 30;
                        Socket.emit('announcement', {message: vm.challengedUser + ' lost ' + challengedPercentLost + '% of their forces in the battle.'});
                        break;
                    case 4:
                        challengedPercentLost = 40;
                        Socket.emit('announcement', {message: vm.challengedUser + ' lost ' + challengedPercentLost + '% of their forces in the battle.'});
                        break;
                }
                //Based on how much of their army was lost, reduce the size of their army
                //Person who was challenged
                challengedInfantryLost = Math.ceil((vm.challengedArmy.infantry / 100) * challengedPercentLost);
                challengedCavalryLost = Math.ceil((vm.challengedArmy.cavalry / 100) * challengedPercentLost);
                challengedArchersLost = Math.ceil((vm.challengedArmy.archers / 100) * challengedPercentLost);
                vm.challengedArmy.infantry -= challengedInfantryLost;
                vm.challengedArmy.cavalry -= challengedCavalryLost;
                vm.challengedArmy.archers -= challengedArchersLost;
                //The logged in user
                userInfantryLost = Math.ceil((vm.userArmy.infantry / 100) * userPercentLost);
                userCavalryLost = Math.ceil((vm.userArmy.cavalry / 100) * userPercentLost);
                userArchersLost = Math.ceil((vm.userArmy.archers / 100) * userPercentLost);
                vm.userArmy.infantry -= userInfantryLost;
                vm.userArmy.cavalry -= userCavalryLost;
                vm.userArmy.archers -= userArchersLost;
                //If their whole army was destroyed, delete from DB and from variables
                if (userPercentLost === 100) {
                    Army.delete(vm.userArmy._id)
                        .then(function (data) {

                        });
                    $location.path("/armoury");
                    alert('Your entire army was destroyed!');
                }
                //Otherwise, update their army based on the units lost
                else {
                    //This user was challenged and won, so their wincount increases
                    Army.update(vm.challengedArmy._id, {
                        infantry: vm.challengedArmy.infantry,
                        cavalry: vm.challengedArmy.cavalry,
                        archers: vm.challengedArmy.archers,
                        winCount: vm.challengedArmy.winCount,
                        level: vm.challengedArmy.level
                    });
                    //This user challenged and lost, so their wincount decreases
                    if (vm.userArmy.level < 0) {
                        vm.userArmy.level = 0;
                    }
                    Army.update(vm.userArmy._id, {
                        infantry: vm.userArmy.infantry,
                        cavalry: vm.userArmy.cavalry,
                        archers: vm.userArmy.archers,
                        winCount: vm.userArmy.winCount,
                        level: vm.userArmy.level
                    });
                }
            }
            vm.armies = '';
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
    });