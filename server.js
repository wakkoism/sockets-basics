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

    socket.broadcast.to(clientInfo[socket.id].room).emit('message', message);
  });

  socket.emit('message', {
    timestamp,
    text: 'Welcome to the chat application!',
  });
});

http.listen(PORT, () => {
  console.log('Server started!');
});
