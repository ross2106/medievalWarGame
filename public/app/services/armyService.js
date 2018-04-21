angular.module('armyService', [])

    .factory('Army', function($http) {

        // create a new object
        var armyFactory = {};

        // create a user
        armyFactory.create = function(resourceData) {
            return $http.post('/api/army/', resourceData);
        };

        // update a users resources
        armyFactory.update = function(username, resourceData) {
            return $http.put('/api/army/' + username, resourceData);
        };

        // get all inventories
        armyFactory.all = function() {
            return $http.get('/api/army/');
        };

        // get a users inventory
        armyFactory.get = function(username) {
            return $http.get('/api/army/' + username);
        };

        return armyFactory;
    });