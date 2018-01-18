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

io.on('connection', function (socket) {
  console.log('User connected via socket.io!');

  socket.on('message', function (message) {
    console.log('Message received: ' + message.text);

    socket.broadcast.emit('message', message);
  });

  socket.emit('message', {
    text: 'Welcome to the chat application!',
    'timestamp': (0, _moment2.default)().utc().valueOf()
  });
});

http.listen(PORT, function () {
  console.log('Server started!');
});