angular.module('inventoryService', [])

    .factory('Inventory', function($http) {

        // create a new object
        var resourceFactory = {};

        // create a user
        resourceFactory.create = function(resourceData) {
            return $http.post('/api/inventory/', resourceData);
        };

        // update a users resources
        resourceFactory.update = function(id, resourceData) {
            return $http.put('/api/inventory/' + id, resourceData);
        };

        // get all inventories
        resourceFactory.all = function() {
            return $http.get('/api/inventory/');
        };

        // get a users inventory
        resourceFactory.get = function(id) {
            return $http.get('/api/inventory/' + id);
        };

        return resourceFactory;
    });