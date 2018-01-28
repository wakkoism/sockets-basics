"use strict";

const PORT = process.env.PORT || 3000;
import express from 'express';
import path from 'path';
import moment from 'moment';

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

const getSocketIdByName = (name) => {
  for (let socketId of Object.keys(clientInfo)) {
    if (clientInfo[socketId].name.toLowerCase().trim() === name.toLowerCase()) {
      return socketId;
      break;
    }
  };
  return false;
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
    // Check if the code is running a command
    if (message.text.substring(0, 1) === '@') {
      const command = message.text.substring(1).split(" ");
      switch(command[0]) {
        // Get current user list.
        case 'currentUsers':
          let currentUsers = sendCurrentUsers(socket);
          socket.emit('message', {
            timestamp,
            name: 'System',
            text: `Current users: ${currentUsers.join(', ')}`,
          });
          break;

        // Private message a current user in any room.
        case 'pm':
          if (command[1]) {
            let socketId = getSocketIdByName(command[1].trim());
            if (socketId) {
              // TODO figure out how to private message!
              socket.to(socketId).emit('message', {
                timestamp,
                name: message.name,
                text: `Private: ${command[2]}`,
              });
            }
          }
          break

        default:
          socket.broadcast.to(clientInfo[socket.id].room).emit('message', message);
          break;
      }
    } else {
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
