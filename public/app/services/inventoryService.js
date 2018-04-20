angular.module('inventoryService', [])

    .factory('Inventory', function($http) {

        // create a new object
        var resourceFactory = {};

        // create a user
        resourceFactory.create = function(resourceData) {
            return $http.post('/api/inventory/', resourceData);
        };

        // update a users resources
        resourceFactory.update = function(username, userData) {
            return $http.put('/api/inventory/' + username, userData);
        };

        // get a users inventory
        resourceFactory.get = function(username) {
            return $http.get('/api/inventory/' + username);
        };

        return resourceFactory;
    });