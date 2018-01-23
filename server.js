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

io.on('connection', (socket) => {

  socket.on('joinRoom', (request) => {
    request.room = request.room.toLowerCase();
    socket.join(request.room);
    socket.broadcast.to(request.room).emit('message', {
      name: 'System',
      text: `${request.name} has join!`,
      timestamp: moment().utc().valueOf(),
    });
    clientInfo[socket.id] = request;
  });

  socket.on('message', (message) => {
    console.log(`Message received: ${message.text}`);

    message.timestamp = moment().utc().valueOf();

    socket.broadcast.to(clientInfo[socket.id].room).emit('message', message);
  });

  socket.emit('message', {
    text: 'Welcome to the chat application!',
    timestamp: moment().utc().valueOf(),
  });
});

http.listen(PORT, () => {
  console.log('Server started!');
});
