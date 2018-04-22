angular.module('armyService', [])

    .factory('Army', function($http) {

        // create a new object
        var armyFactory = {};

        // create a user
        armyFactory.create = function(resourceData) {
            return $http.post('/api/army/', resourceData);
        };

        // update a users resources
        armyFactory.update = function(id, resourceData) {
            return $http.put('/api/army/' + id, resourceData);
        };

        // get all inventories
        armyFactory.all = function() {
            return $http.get('/api/army/');
        };

        // get a users inventory
        armyFactory.get = function(id) {
            return $http.get('/api/army/' + id);
        };

        // delete a user
        armyFactory.delete = function(id) {
            return $http.delete('/api/army/' + id);
        };

        return armyFactory;
    });