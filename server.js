// BASE SETUP
// ======================================

// CALL THE PACKAGES --------------------
var express = require('express');
var app = express(); // define our app using express
var bodyParser = require('body-parser'); // get body-parser
var morgan = require('morgan'); // used to see requests
var mongoose = require('mongoose');
var config = require('./config');
var path = require('path');

//socket IO stuff
var http = require('http').Server(app);
var io = require('socket.io')(http,{});


// APP CONFIGURATION ==================
// ====================================
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

// log all requests to the console
app.use(morgan('dev'));

// connect to our database (hosted on modulus.io)
mongoose.connect(config.database);

// set static files location
// used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));

// ROUTES FOR OUR API =================
// ====================================

// API ROUTES ------------------------
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

// MAIN CATCHALL ROUTE ---------------
// SEND USERS TO FRONTEND ------------
// has to be registered after API ROUTES
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

// START THE SERVER
// ====================================
http.listen(process.env.PORT || config.port);
console.log('Magic happens on port ' + config.port);

var SOCKET_LIST = {};
var PLAYER_LIST = {};

var Player = function(id, username){
    var self = {
        x:250,
        y:250,
        id:id,
        username: username,
        pressingRight:false,
        pressingLeft:false,
        pressingUp:false,
        pressingDown:false,
        maxSpd:10
    };
    self.updatePosition = function(){
        if(self.pressingRight)
            self.x += self.maxSpd;
        if(self.pressingLeft)
            self.x -= self.maxSpd;
        if(self.pressingUp)
            self.y -= self.maxSpd;
        if(self.pressingDown)
            self.y += self.maxSpd;
    };
    return self;
};

//SOCKET
var users = [];
io.sockets.on('connection', function(socket){
    var username = '';
    var player = '';
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    console.log('A user has connected');

    socket.on('request-users', function(){
        socket.emit('users', {users: users});
    });

    socket.on('add-user', function(data){
        io.emit('add-user', {
            username: data.username
        });
        username = data.username;
        player = Player(socket.id, username);
        PLAYER_LIST[socket.id] = player;
        users.push(data.username);
    });

    socket.on('message', function(data){
        io.emit('message', {username: username, message: data.message});
    });

    socket.on('command', function(data){
        io.emit('command', {command: data.command});
    });

    socket.on('keyPress',function(data){
        if(data.inputId === 'left')
            player.pressingLeft = data.state;
        else if(data.inputId === 'right')
            player.pressingRight = data.state;
        else if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if(data.inputId === 'down')
            player.pressingDown = data.state;
    });

    socket.on('disconnect', function(){
        console.log(username + ' has disconnected!');
        users.splice(users.indexOf(username), 1);
        io.emit('remove-user', {username: username});
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });
});
setInterval(function(){
    var pack = [];
    for(var i in PLAYER_LIST){
        var player = PLAYER_LIST[i];
        player.updatePosition();
        pack.push({
            x:player.x,
            y:player.y,
            username:player.username
        });
    }
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
    }
},40);







