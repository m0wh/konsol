const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { generateUsername } = require('username-generator');
const { generateColor } = require('./utils');

const port = process.env.PORT || 3000;

app.use(express.static('public'));

let users = {};

io.on('connection', socket => {
  socket.name = generateUsername("_");
  socket.color = generateColor();
  users[socket.id] = {
    name: socket.name,
    color: socket.color
  }

  io.emit("userJoined", users);

  socket.on('typing', () => {
    socket.broadcast.emit('someoneTyping', socket.name);
  });

  socket.on('sendMessage', content => {
    const message = {
      from: socket.id,
      time: Date.now,
      text: content
    };

    io.emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    io.emit("userQuit", users);
  });
});


http.listen(port, () => console.log(`Listening on port ${port}`));