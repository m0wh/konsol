var socket = io();
var users;

var messageInput = document.querySelector("#input");
var chatContainer = document.querySelector("#messages");
var userCounter = document.querySelector("#userCounter");


messageInput.addEventListener("keyup", keyChange);
messageInput.addEventListener("keypress", keyChange);

function keyChange(e) {
  messageInput.value = messageInput.value.replace(/\n/g, "");
  if (messageInput.value.length > 0) {
    if (e.key === "Enter") {
      socket.emit("sendMessage", messageInput.value);
      messageInput.value = "";
    }

    console.log("typing")
    socket.emit("typing");
  }
}

socket.on("userJoined", function(allUsers) {
  users = allUsers;
  userCounter.innerHTML = Object.keys(users).length;
});

socket.on("userQuit", function(allUsers) {
  users = allUsers;
  userCounter.innerHTML = Object.keys(users).length;
});

socket.on("newMessage", function(message) {
  console.log(message);
  
  var html = "<div class=\"post\">\
      <p class=\"info\"><span class=\"time\">" + moment(message.time).format("hh:mm") + "</span> <span class=\"author\" style=\"color:" + users[message.from].color.main + ";--alt-color:" + users[message.from].color.alt + "\">" + users[message.from].name + "</span></p>\
      <p class=\"message\">" + message.text + "</p>\
    </div>"

  chatContainer.innerHTML += html;
});