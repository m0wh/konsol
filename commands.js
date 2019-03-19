const commands = [
  {
    "keywords": ["name", "n"],
    "callback": ({ socket, args }) => {
      socket.name = args[0];
      users[socket.id].name = socket.name;
      io.emit("rename", { allUsers: users, id: socket.id });
    }
  },
  {
    "keywords": ["color", "c"],
    "callback": ({ socket, args }) => recolor(args[0])
  },
  {
    "keywords": ["me"],
    "callback": ({ socket, args }) => io.emit("meAction", {
      id: socket.id,
      action: args[0],
      time: Date.now()
    })
  },
  {
    "keywords": ["clear"],
    "callback": ({ socket }) => socket.emit("clearConsole")
  },
  {
    "keywords": ["help", "h", "?"],
    "callback": ({ socket }) => socket.emit("displayHelp", Date.now())
  }
];


const exec = (socket, commandString) => {
  const { keyword, args } = { keyword: commandString.substr(1).split(" ")[0], args: commandString.substr(1).split(" ").slice(1) }
  commands.forEach(command => command.keywords.includes(keyword) ? command.callback({ socket, args }) : commandError({ socket, args }))
}