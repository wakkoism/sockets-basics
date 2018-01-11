"use strict";

const PORT = process.env.PORT || 3000;
import express from 'express';
import path from 'path';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', () => {
  console.log('User connected via socket.io!');
});

http.listen(PORT, () => {
  console.log('Server started!');
});
