const socket = io();

socket.on('connect', () => {
  console.log('Connected to socket.io server!');
});

socket.on('message', (message) => {
  console.log('New message');
  console.log(message.text);
});
