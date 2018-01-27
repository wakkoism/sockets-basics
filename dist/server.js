"use strict";

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PORT = process.env.PORT || 3000;


var app = (0, _express2.default)();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(_express2.default.static('public'));

var clientInfo = {};

var timestamp = _moment2.default.utc.valueOf();

io.on('connection', function (socket) {
  socket.on('disconnect', function () {
    var userData = clientInfo[socket.id];
    if (typeof clientInfo[socket.id] !== 'undefined') {
      socket.leave(userData.room);
      io.to(userData.room).emit('message', {
        timestamp: timestamp,
        name: 'System',
        text: userData.name + ' has left the room!'
      });
      delete clientInfo[socket.id];
    }
  });

  socket.on('joinRoom', function (request) {
    request.room = request.room.toLowerCase();
    socket.join(request.room);
    socket.broadcast.to(request.room).emit('message', {
      timestamp: timestamp,
      name: 'System',
      text: request.name + ' has join!'
    });
    clientInfo[socket.id] = request;
  });

  socket.on('message', function (message) {
    console.log('Message received: ' + message.text);

    message.timestamp = timestamp;

    socket.broadcast.to(clientInfo[socket.id].room).emit('message', message);
  });

  socket.emit('message', {
    timestamp: timestamp,
    text: 'Welcome to the chat application!'
  });
});

http.listen(PORT, function () {
  console.log('Server started!');
});