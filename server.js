"use strict";

const PORT = process.env.PORT || 3000;
import express from 'express';
import path from 'path';
import moment from 'moment';
import htmlencode from 'htmlencode';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const clientInfo = {};

const timestamp = moment.utc.valueOf();

const sendCurrentUsers = (socket) => {
  const info = clientInfo[socket.id];
  const users = [];

  if (typeof info === 'undefined') {
    return;
  }

  Object.keys(clientInfo).forEach((socketId) => {
    let userInfo = clientInfo[socketId];

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
const getSocketIdByName = (name) => {
  name = name.replace('+', ' ');
  for (let socketId of Object.keys(clientInfo)) {
    if (clientInfo[socketId].name.toLowerCase().trim() === name.toLowerCase()) {
      return socketId;
      break;
    }
  };
  return false;
};

const getHelpCommand = () => {
  return [
    `<ul>`,
    `<li><strong>#currentUsers</strong> - Display all the current users.</li>`,
    `<li><strong>@[username] message</strong> - where [username] is the person you want to private message.</li>`,
    `</ul>`
  ].join('');
};

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    const userData = clientInfo[socket.id];
    if (typeof clientInfo[socket.id] !== 'undefined') {
      socket.leave(userData.room);
      io.to(userData.room).emit('message', {
        timestamp,
        name: 'System',
        text: `${userData.name} has left the room!`,
      });
      delete clientInfo[socket.id];
    }
  });

  socket.on('joinRoom', (request) => {
    request.room = request.room.toLowerCase();
    socket.join(request.room);
    socket.broadcast.to(request.room).emit('message', {
      timestamp,
      name: 'System',
      text: `${request.name} has join!`,
    });
    clientInfo[socket.id] = request;
  });

  socket.on('message', (message) => {
    console.log(`Message received: ${message.text}`);

    message.timestamp = timestamp;
    const firstChr = message.text.substring(0, 1);
    // Check if the code is running a command
    if (firstChr === '@' || firstChr === '#') {
      // Only separate the first space.  Second array can contain many spaces.
      const command = message.text.split(/ (.+)/, 2);
      switch(command[0]) {
        case '#help':
          const helpCommand = getHelpCommand();
          socket.emit('message', {
            timestamp,
            name: 'System',
            text: helpCommand,
          });
          break;
        // Get current user list.
        case '#currentUsers':
          let currentUsers = sendCurrentUsers(socket);
          socket.emit('message', {
            timestamp,
            name: 'System',
            text: `Current users: ${currentUsers.join(', ')}`,
          });
          break;

        // TODO: Instead of doing pm, it's better to use @user and #command
        // Private message a current user in any room.
        default:
          if (firstChr === '@' &&
              typeof command[1] !== 'undefined'
              && command[1] !== '') {
            // Grab the socket ID of the user when using @username
            let socketId = getSocketIdByName(command[0].substring(1).trim());
            if (socketId) {
              socket.to(socketId).emit('message', {
                timestamp,
                name: message.name,
                text: `Private: ${htmlencode.htmlEncode(command[1])}`,
              });
            }
          }
          break;
      }
    } else {
      message.text = htmlencode.htmlEncode(message.text);
      socket.broadcast.to(clientInfo[socket.id].room).emit('message', message);
    }
  });

  socket.emit('message', {
    timestamp,
    text: 'Welcome to the chat application!',
  });
});

http.listen(PORT, () => {
  console.log('Server started!');
});
