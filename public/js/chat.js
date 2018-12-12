var socket = io();
var users;

var messageInput = document.querySelector("#input");
var chatContainer = document.querySelector("#messages");
var userCounter = document.querySelector("#user-counter");
var typingContainer = document.querySelector("#typing-container");


messageInput.addEventListener("keypress", keyChange);
messageInput.addEventListener("keyup", function(e) {
  keyChange(e);
  socket.emit("typingEvent", messageInput.value.length > 0);
});

function keyChange(e) {
  messageInput.value = messageInput.value.replace(/\n/g, "");
  if (messageInput.value.length > 0) {
    if (e.key === "Enter") {
      socket.emit("sendMessage", messageInput.value);
      messageInput.value = "";
    }
  }
}

socket.on("userJoined", function(data) {
  users = data.allUsers;
  userCounter.innerHTML = Object.keys(users).length;
});

socket.on("userQuit", function(data) {
  users = data.allUsers;
  userCounter.innerHTML = Object.keys(users).length;
});

socket.on("rename", function(data) {
  chatContainer.innerHTML += "\
    <div class=\"post notification\">\
      <p class=\"message\"><span class=\"user\" style=\"color:" + users[data.id].color.main + "\">" + users[data.id].name + "</span> is now <span style=\"color:" + users[data.id].color.main + "\">" + data.allUsers[data.id].name + "</span>!</p>\
    </div>\
  ";
  users = data.allUsers;
  userCounter.innerHTML = Object.keys(users).length;
});

socket.on("recolor", function(data) {
  chatContainer.innerHTML += "\
    <div class=\"post notification\">\
      <p class=\"message\"><span class=\"user\" style=\"color:" + users[data.id].color.main + "\">" + users[data.id].name + "</span>'s color is now <span style=\"color:" + data.allUsers[data.id].color.main + "\">" + data.allUsers[data.id].color.main + "</span>!</p>\
    </div>\
  ";
  users = data.allUsers;
  userCounter.innerHTML = Object.keys(users).length;
});

socket.on("clearConsole", function() {
  chatContainer.innerHTML = "";
});

socket.on("displayHelp", function(data) {
  chatContainer.innerHTML = "\
    <div class=\"post help notification\">\
      <p class=\"info\"><span class=\"time\">" + moment(data.time).format("HH:mm") + "</span> Help</p>\
      <p class=\"message\"><b>/help: </b> displays some help.</p>\
      <p class=\"message\"><b>/username &lt;new name&gt;: </b> changes your username.</p>\
      <p class=\"message\"><b>/color &lt;color number (0-7)&gt;: </b> changes your color.</p>\
      <p class=\"message\"><b>/me &lt;action&gt;: </b> displays a notification about yourself.</p>\
      <p class=\"message\"><b>/clear: </b> clears the console.</p>\
    </div>\
  ";
});

socket.on("meAction", function(data) {
  chatContainer.innerHTML += "\
    <div class=\"post me notification\">\
      <p class=\"info\"><span class=\"time\">" + moment(data.time).format("HH:mm") + "</span></p>\
      <p class=\"message\"><span class=\"actor\" style=\"color:" + users[data.id].color.main + "\">" + users[data.id].name + "</span> " + data.action + "</p>\
    </div>\
  ";
});

socket.on("newMessage", function(message) {
  chatContainer.innerHTML += "\
    <div class=\"post talk\">\
      <p class=\"info\"><span class=\"time\">" + moment(message.time).format("HH:mm") + "</span> <span class=\"author\" style=\"color:" + users[message.from].color.main + ";--alt-color:" + users[message.from].color.alt + "\">" + users[message.from].name + "</span></p>\
      <p class=\"message\">" + message.text + "</p>\
    </div>\
  ";
});

socket.on("typing", function(typingIDs) {
  var html;

  if (typingIDs.length == 0) {
    html = "<p></p>";

  } else {
    var names = [];
    for (var i = 0; i < typingIDs.length; i++) {
      names.push("<span class=\"name\">" + users[typingIDs[i]].name + "</span>");
    }

    html = "<p>" + formatStringArray(names, true) + " typing...</p>";
  }

  typingContainer.innerHTML = html;
});

socket.on("commandError", function(err) {
  console.warn(err);
})

function formatStringArray(arr, beVerb) {
  var be = " is";

  if (arr.length > 1) {
    var and = arr[arr.length-2] + " and " + arr[arr.length-1];
    arr.splice(arr.length-2, 2, and);
    be = " are"
  }

  if (!beVerb) be = "";
  
  return arr.join(", ") + be;
}