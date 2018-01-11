"use strict";

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PORT = process.env.PORT || 3000;


var app = (0, _express2.default)();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(_express2.default.static(_path2.default.join(__dirname, 'public')));

io.on('connection', function () {
  console.log('User connected via socket.io!');
});

http.listen(PORT, function () {
  console.log('Server started!');
});
