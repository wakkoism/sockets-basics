const PORT = process.env.PORT || 3000;
const express = require('express');
const path = require('path');

const app = express();
const http = require('http').Server(app);

app.use(express.static(path.join(__dirname, 'public')));

http.listen(PORT, () => {
  console.log('Server started!');
});
