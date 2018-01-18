"use strict";

const PORT = process.env.PORT || 3000;
import express from 'express';
import path from 'path';
import moment from 'moment';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('User connected via socket.io!');

  socket.on('message', (message) => {
    console.log(`Message received: ${message.text}`)

    socket.broadcast.emit('message', message);
  });

  socket.emit('message', {
    text: 'Welcome to the chat application!',
    'timestamp': moment().valueOf(),
  });
});

http.listen(PORT, () => {
  console.log('Server started!');
});
