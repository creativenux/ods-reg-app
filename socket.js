var express = require('express'),
    socket = require('socket.io'); 

var app = express();
var server = app.listen(8001, function() {
    console.log('App running on port 8001');
});

var io = socket(server);
var checked_in = 0;
var connections = [];

io.on('connection', function(socket) {
    connections.push(socket);
    console.log('Client connected. Total clients: %s ', connections.length, socket.id);
    
    socket.on('checked_in', function() {
        checked_in += 1;
        io.sockets.emit('checked_in', checked_in);
    });
});