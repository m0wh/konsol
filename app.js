const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { generateUsername } = require('username-generator');
const { generateColor } = require('./utils');

const port = process.env.PORT || 3000;

app.use(express.static('public'));

let users = {};
let typingIDs = [];

io.on('connection', socket => {
  socket.name = generateUsername("_").replace("-","");
  socket.color = generateColor();
  users[socket.id] = {
    name: socket.name,
    color: socket.color
  }

  io.emit("userJoined", { allUsers: users, id: socket.id });

  socket.on('typingEvent', isTyping => {
    if (typingIDs.indexOf(socket.id) !== -1) {
      typingIDs.splice(typingIDs.indexOf(socket.id), 1);
    }

    if (isTyping) {
      typingIDs.push(socket.id);
    }
    
    io.emit('typing', typingIDs);
  });

  socket.on('sendMessage', data => {
    const content = data.trim();
    if (content[0] === "/") { // It's a command !
      const command = {
        command: content.substr(1).split(" ")[0],
        arguments: content.substr(1).split(" ").slice(1)
      }
      
      if (["username", "un"].includes(command.command)) {
        rename(command.arguments[0])
      } else if (["color", "c"].includes(command.command)) {
        if (command.arguments[0] < 8 && command.arguments[0] >= 0) {
          recolor(command.arguments[0]);
        }
      } else if (["me"].includes(command.command)) {
        io.emit("meAction", { id: socket.id, action: command.arguments.join(" "), time: Date.now() });
      } else if (["clear", "cls"].includes(command.command)) {
        socket.emit("clearConsole");
      } else if (["help", "h", "?"].includes(command.command)) {
        socket.emit("displayHelp", { time: Date.now() });
      } else {
        socket.emit("commandError", `Unknown command /${command.command}`);
      }

    } else {
      const message = {
        from: socket.id,
        time: Date.now,
        text: content
      };

      io.emit('newMessage', message);
    }
  });

  socket.on('disconnect', () => {
    io.emit("userQuit", { allUsers: users, id: socket.id });
  });


  const rename = newName => {
    socket.name = newName;
    users[socket.id].name = socket.name;
    io.emit("rename", { allUsers: users, id: socket.id });
  }

  const recolor = newColor => {
    socket.color = generateColor(newColor);
    users[socket.id].color = socket.color;
    io.emit("recolor", { allUsers: users, id: socket.id });
  }
});


http.listen(port, () => console.log(`Listening on port ${port}`));