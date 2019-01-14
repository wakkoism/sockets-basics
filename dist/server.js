"use strict";

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _htmlencode = require('htmlencode');

var _htmlencode2 = _interopRequireDefault(_htmlencode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PORT = process.env.PORT || 3000;


var app = (0, _express2.default)();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(_express2.default.static('public'));

var clientInfo = {};

var timestamp = _moment2.default.utc.valueOf();

var sendCurrentUsers = function sendCurrentUsers(socket) {
  var info = clientInfo[socket.id];
  var users = [];

  if (typeof info === 'undefined') {
    return;
  }

  Object.keys(clientInfo).forEach(function (socketId) {
    var userInfo = clientInfo[socketId];

    if (userInfo.room === info.room) {
      users.push(userInfo.name);
    }
  });

  return users;
};

/**
 * @param {string} name
 *   The username, if spaces, username be a plus to separate the spaces.
 */
var getSocketIdByName = function getSocketIdByName(name) {
  name = name.replace('+', ' ');
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.keys(clientInfo)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var socketId = _step.value;

      if (clientInfo[socketId].name.toLowerCase().trim() === name.toLowerCase()) {
        return socketId;
        break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  ;
  return false;
};

var getHelpCommand = function getHelpCommand() {
  return ['<ul>', '<li><strong>#currentUsers</strong> - Display all the current users.</li>', '<li><strong>@[username] message</strong> - where [username] is the person you want to private message.</li>', '</ul>'].join('');
};

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
    var firstChr = message.text.substring(0, 1);
    // Check if the code is running a command
    if (firstChr === '@' || firstChr === '#') {
      // Only separate the first space.  Second array can contain many spaces.
      var command = message.text.split(/ (.+)/, 2);
      switch (command[0]) {
        case '#help':
          var helpCommand = getHelpCommand();
          socket.emit('message', {
            timestamp: timestamp,
            name: 'System',
            text: helpCommand
          });
          break;
        // Get current user list.
        case '#currentUsers':
          var currentUsers = sendCurrentUsers(socket);
          socket.emit('message', {
            timestamp: timestamp,
            name: 'System',
            text: 'Current users: ' + currentUsers.join(', ')
          });
          break;

        // TODO: Instead of doing pm, it's better to use @user and #command
        // Private message a current user in any room.
        default:
          if (firstChr === '@' && typeof command[1] !== 'undefined' && command[1] !== '') {
            // Grab the socket ID of the user when using @username
            var socketId = getSocketIdByName(command[0].substring(1).trim());
            if (socketId) {
              socket.to(socketId).emit('message', {
                timestamp: timestamp,
                name: message.name,
                text: 'Private: ' + _htmlencode2.default.htmlEncode(command[1])
              });
            }
          }
          break;
      }
    } else {
      message.text = _htmlencode2.default.htmlEncode(message.text);
      socket.broadcast.to(clientInfo[socket.id].room).emit('message', message);
    }
  });

  socket.emit('message', {
    timestamp: timestamp,
    text: 'Welcome to the chat application!'
  });
});

http.listen(PORT, function () {
  console.log('Server started!');
});