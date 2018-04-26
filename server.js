// BASE SETUP
// ======================================

// CALL THE PACKAGES --------------------
var express = require('express');
var app = express(); // define our app using express
var bodyParser = require('body-parser'); // get body-parser
var morgan = require('morgan'); // used to see requests
var mongoose = require('mongoose'); // used for database connection
var config = require('./config'); //configuration files
var path = require('path'); //Ensures we can work with file directories

// APP CONFIGURATION ==================
// ====================================
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

// log all requests to the console
app.use(morgan('dev'));

// connect to our database
mongoose.connect(config.database);

// set static files location
// used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));

// API ROUTES ------------------------
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

// MAIN CATCHALL ROUTE ---------------
// SEND USERS TO FRONTEND ------------
// has to be registered after API ROUTES
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

// START THE SERVER
// ====================================
//http.listen(config.port);
var server = app.listen(config.port);
var io = require('socket.io').listen(server);

// Those connected via socket IO
var SOCKET_LIST = {};
var PLAYER_LIST = {};

//Used on the 'Home base' page and 'Battle page' for the chat and interactive user map
var Player = function (id, username) {
    var self = {
        x: 250,
        y: 250,
        id: id,
        username: username,
        pressingRight: false,
        pressingLeft: false,
        pressingUp: false,
        pressingDown: false,
        maxSpd: 7
    };
    //Function to update the position of your character on the map
    self.updatePosition = function () {
        if (self.pressingRight) {
            if (self.x > 450) {
                self.x -= 1;
            } else {
                self.x += self.maxSpd;
            }
        }
        if (self.pressingLeft) {
            if (self.x < 10) {
                self.x += 1;
            } else {
                self.x -= self.maxSpd;
            }
        }
        if (self.pressingUp) {
            if (self.y < 20) {
                self.y += 1;
            } else {
                self.y -= self.maxSpd;
            }
        }
        if (self.pressingDown) {
            if (self.y > 450) {
                self.y -= 1;
            }
            else {
                self.y += self.maxSpd;
            }
        }

    };
    return self;
};

//Socket Connections
var users = []; //List of users
io.on('connection', function (socket) {
    var username = '';
    var player = '';
    //Assign a random ID for each socket and add it to the list
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    console.log('A user has connected'); //Called whenever a new socket connection is initialized

    socket.on('request-users', function () {
        socket.emit('users', {users: users}); //Online user list
    });

    socket.on('message', function (data) {
        io.emit('message', {username: username, message: data.message}); //Emit messages to the chat
    });

    socket.on('challenge', function (data) {
        socket.emit('challenge', {username: username, message: data.message}); //Emit challenge information for the battle page
    });

    socket.on('announcement', function (data) {
        io.emit('announcement', {message: data.message}); //Announcement made on the battle page
    });

    // Adds a new user to the connection list
    socket.on('add-user', function (data) {
        io.emit('add-user', {
            username: data.username
        });
        username = data.username;
        users.push(data.username);
        player = Player(socket.id, username);
        PLAYER_LIST[socket.id] = player;
    });

    //Called whenever a user disconnects
    socket.on('disconnect', function () {
        console.log(username + ' has disconnected!');
        users.splice(users.indexOf(username), 1);
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
        io.emit('remove-user', {username: username});
        io.emit('battle-remove-user', {username: username});
    });

    //Called on each key press on the interactive map
    socket.on('keyPress', function (data) {
        if (data.inputId === 'left')
            player.pressingLeft = data.state;
        else if (data.inputId === 'right')
            player.pressingRight = data.state;
        else if (data.inputId === 'up')
            player.pressingUp = data.state;
        else if (data.inputId === 'down')
            player.pressingDown = data.state;
    });
});
//Draws the players position on the map
setInterval(function () {
    var pack = [];
    for (var i in PLAYER_LIST) {
        var player = PLAYER_LIST[i];
        player.updatePosition();
        pack.push({
            x: player.x,
            y: player.y,
            username: player.username
        });
    }
    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions', pack);
    }
}, 40);







