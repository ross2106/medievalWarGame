angular.module('userCtrl', [])
    .controller('userController', function (User) {

        var vm = this;

        // set a processing variable to show loading things
        vm.processing = true;

        // grab all the users at page load
        User.all()
            .then(function (data) {

                // when all the users come back, remove the processing variable
                vm.processing = false;

                // bind the users that come back to vm.users
                vm.users = data.data;
            });

        // function to delete a user
        vm.deleteUser = function (id) {
            vm.processing = true;

            User.delete(id)
                .then(function (data) {

                    // get all users to update the table
                    // you can also set up your api
                    // to return the list of users with the delete call
                    User.all()
                        .then(function (data) {
                            vm.processing = false;
                            vm.users = data;
                        });

                });
        };

        // function to save the user
        vm.saveUser = function () {
            vm.processing = true;
            vm.message = '';

            // call the userService function to update
            User.update($routeParams.username, vm.userData)
                .then(function (data) {
                    vm.processing = false;

                    // clear the form
                    vm.userData = {};

                    // bind the message from our API to vm.message
                    vm.message = data.message;
                });
        };

    });