angular.module('leaderboardCtrl', [])
    .controller('leaderboardController', function (Army, $scope) {
        //Connect the socket

        $scope.armies = '';

        $scope.getStats = function (callback) {
            Army.all()
                .then(function (data) {
                    $scope.armies = data.data;
                    callback();
                });
        };
        $scope.getStats(function () {
            console.log('Finished getting stats');
        });
    });