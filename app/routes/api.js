var bodyParser = require('body-parser'); // get body-parser
var User = require('../models/user');
var Inventory = require('../models/inventory');
var Army = require('../models/army');
var jwt = require('jsonwebtoken');
var config = require('../../config');

// super secret for creating tokens
var superSecret = config.secret;

module.exports = function (app, express) {

    var apiRouter = express.Router();

    // route to register a user
    apiRouter.post('/register', function (req, res) {

        // look for the user named chris
        User.findOne({
            'username': req.body.username
        }, function (err, user) {
            // if there is no chris user, create one
            if (!user) {
                var newUser = new User();
                newUser.name = req.body.name;
                newUser.username = req.body.username;
                newUser.password = req.body.password;
                newUser.save();
                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'New user created!'
                });
            } else {

            }
        });

    });

    // route to authenticate a user (POST http://localhost:8080/api/authenticate)
    apiRouter.post('/authenticate', function (req, res) {

        // find the user
        User.findOne({
            username: req.body.username
        }).select('name username password').exec(function (err, user) {

            if (err) throw err;

            // no user with that username was found
            if (!user) {
                res.json({
                    success: false,
                    message: 'Incorrect username or password'
                });
            } else if (user) {

                // check if password matches
                var validPassword = user.comparePassword(req.body.password);
                if (!validPassword) {
                    res.json({
                        success: false,
                        message: 'Incorrect username or password'
                    });
                } else {
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign({
                        name: user.name,
                        username: user.username
                    }, superSecret, {
                        expiresIn: '24h' // expires in 24 hours
                    });

                    // return the information including token as JSON
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                }

            }

        });
    });

    // route middleware to verify a token
    apiRouter.use(function (req, res, next) {
        // do logging
        console.log('Somebody just came to our app!');

        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        // decode token
        if (token) {

            // verifies secret and checks exp
            jwt.verify(token, superSecret, function (err, decoded) {

                if (err) {
                    res.status(403).send({
                        success: false,
                        message: 'Failed to authenticate token.'
                    });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;

                    next(); // make sure we go to the next routes and don't stop here
                }
            });

        } else {

            // if there is no token
            // return an HTTP response of 403 (access forbidden) and an error message
            res.status(403).send({
                success: false,
                message: 'No token provided.'
            });

        }
    });

    // test route to make sure everything is working
    // accessed at GET http://localhost:8080/api
    apiRouter.get('/', function (req, res) {
        res.json({
            message: 'hooray! welcome to our api!'
        });
    });

    apiRouter.route('/dashboard');

    // on routes that end in /resources
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************

    apiRouter.route('/inventory')
    //create an inventory for a user
        .post(function (req, res) {
            var inventory = new Inventory();
            inventory.username = req.body.username;
            inventory.gold = req.body.gold;
            inventory.food = req.body.food;
            inventory.wood = req.body.wood;
            inventory.save(function (err) {
                if (err) return res.send();
                res.json({message: 'Inventory Created!'});
            });
        })
        .get(function (req, res) {
            Inventory.find({}, function (err, inventories) {
                if (err) res.send(err);

                // return the inventories
                res.json(inventories)
            });
        });


    apiRouter.route('/inventory/:id')
        .put(function (req, res) {
            Inventory.findById(req.params.id, function (err, inventory) {
                if (err) res.send(err);
                if (req.body.gold) inventory.gold = req.body.gold;
                if (req.body.food) inventory.food = req.body.food;
                if (req.body.wood) inventory.wood = req.body.wood;
                // save the inventory
                inventory.save(function (err) {
                    if (err) {
                        return res.send();
                    }
                    res.json({message: 'Inventory Updated!'});
                });
            })
        })

        .get(function (req, res) {
            Inventory.findById(req.params.id, function (err, inventory) {
                if (err) res.send(err);

                //return the inventory
                res.json(inventory);
            })
        });

    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************

    apiRouter.route('/army')
    //create an army for a user
        .post(function (req, res) {
            var army = new Army();
            army.username = req.body.username;
            army.infantry = req.body.infantry;
            army.archers = req.body.archers;
            army.cavalry = req.body.cavalry;
            army.level = req.body.level;
            army.winCount = req.body.winCount;
            army.save(function (err) {
                if (err) return res.send();
                res.json({message: 'Army Created!'});
            });
        })
        .get(function (req, res) {
            Army.find({}, function (err, armies) {
                if (err) res.send(err);
                // return the armies
                res.json(armies)
            });
        });


    apiRouter.route('/army/:id')
        .put(function (req, res) {
            Army.findById(req.params.id, function (err, army) {
                if (err) res.send(err);
                if (req.body.infantry) army.infantry = req.body.infantry;
                if (req.body.archers) army.archers = req.body.archers;
                if (req.body.cavalry) army.cavalry = req.body.cavalry;
                if (req.body.level) army.level = req.body.level;
                if (req.body.winCount) army.winCount = req.body.winCount;
                // save the inventory
                army.save(function (err) {
                    if (err) {
                        return res.send();
                    }
                    res.json({message: 'Army Updated!'});
                });
            })
        })

        .get(function (req, res) {
            Army.findById(req.params.id, function (err, army) {
                if (err) res.send(err);

                //return the inventory
                res.json(army);
            })
        })

        // delete the user with this id
        .delete(function (req, res) {
            Army.remove({
                _id: req.params.id
            }, function (err) {
                if (err) res.send(err);

                res.json({
                    message: 'Army destroyed.'
                });
            });
        });

    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************
    // *********************************************************************************


    // on routes that end in /users
    // ----------------------------------------------------
    apiRouter.route('/users')

    // create a user (accessed at POST http://localhost:8080/users)
        .post(function (req, res) {

            var user = new User(); // create a new instance of the User model
            user.name = req.body.name; // set the users name (comes from the request)
            user.username = req.body.username; // set the users username (comes from the request)
            user.password = req.body.password; // set the users password (comes from the request)

            user.save(function (err) {
                if (err) {
                    // duplicate entry
                    if (err.code == 11000)
                        return res.json({
                            success: false,
                            message: 'A user with that username already exists. '
                        });
                    else
                        return res.send(err);
                }

                // return a message
                res.json({
                    message: 'User created!'
                });
            });

        })

        // get all the users (accessed at GET http://localhost:8080/api/users)
        .get(function (req, res) {

            User.find({}, function (err, users) {
                if (err) res.send(err);

                // return the users
                res.json(users);
            });
        });

    // on routes that end in /users/:user_id
    // ----------------------------------------------------
    apiRouter.route('/users/:user_id')

    // get the user with that id
        .get(function (req, res) {
            User.findById(req.params.user_id, function (err, user) {
                if (err) res.send(err);

                // return that user
                res.json(user);
            });
        })

        // update the user with this id
        .put(function (req, res) {
            User.findById(req.params.user_id, function (err, user) {
                if (err) res.send(err);

                // set the new user information if it exists in the request
                if (req.body.name) user.name = req.body.name;
                if (req.body.username) user.username = req.body.username;
                if (req.body.password) user.password = req.body.password;

                // save the user
                user.save(function (err) {
                    if (err) res.send(err);
                    // return a message
                    res.json({
                        message: 'User updated!'
                    });
                });

            });
        })

        // delete the user with this id
        .delete(function (req, res) {
            User.remove({
                _id: req.params.user_id
            }, function (err, user) {
                if (err) res.send(err);

                res.json({
                    message: 'Successfully deleted'
                });
            });
        });

    // api endpoint to get user information
    apiRouter.get('/me', function (req, res) {
        res.send(req.decoded);
    });

    return apiRouter;
};