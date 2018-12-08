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

socket.on("userJoined", function(allUsers) {
  users = allUsers;
  userCounter.innerHTML = Object.keys(users).length;
});

socket.on("userQuit", function(allUsers) {
  users = allUsers;
  userCounter.innerHTML = Object.keys(users).length;
});

socket.on("newMessage", function(message) {
  chatContainer.innerHTML += "\
    <div class=\"post\">\
      <p class=\"info\"><span class=\"time\">" + moment(message.time).format("hh:mm") + "</span> <span class=\"author\" style=\"color:" + users[message.from].color.main + ";--alt-color:" + users[message.from].color.alt + "\">" + users[message.from].name + "</span></p>\
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