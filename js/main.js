const socket = io();

socket.on('connect', () =>{
    console.log('Connected to socket.io server!');
});
