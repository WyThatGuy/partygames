const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//  Max players for each game
const rankedifyMaxPlayers = 6

//  Min players for each game
const rankedifyMinPlayers = 3

//  Monitoring games
var codeList = []
var gameList = []
var playerCountList = []
var newCode = ""


// Page links
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use('/chat', (req, res) => {
    res.sendFile(__dirname + '/chat/chat.html');
});

app.use('/join', (req, res) => {
    res.sendFile(__dirname + "/join.html")
})

app.use('/rankedify', (req, res) => {
    res.sendFile(__dirname + "/rankedify.html")
})

// socket stuff
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
    console.log('user disconnected');
    });
    socket.on('sentChat', (msg) => {
        io.emit('allChat', {message: msg})
      });
    socket.on('createGame', (ev) => {
        while (codeList.includes(newCode) || newCode == "") {
            newCode = Math.random().toString(36).substring(2,7)
        }
        codeList.push(newCode)
        gameList.push(ev)
        playerCountList.push(0)
        socket.emit("createGame", newCode)
        console.log('New "' + ev + '" game created with code ' + newCode)
        console.log('Active games: ' + codeList.join(", "))
    })
    socket.onAny((eventName, args) => {
        if (codeList.includes(eventName.toString())) {
            var maxPlayers = 0;
            var minPlayers = 1;
            if (gameList[codeList.indexOf(eventName.toString())] == "rankedify") {
                maxPlayers = rankedifyMaxPlayers
            }
            if (gameList[codeList.indexOf(eventName.toString())] == "rankedify") {
                minPlayers = rankedifyMinPlayers
            }
            if (args[1] == "join" && playerCountList[codeList.indexOf(eventName.toString())] < maxPlayers) {
                console.log(args[0] + " joined game " + eventName)
                playerCountList[codeList.indexOf(eventName.toString())] = playerCountList[codeList.indexOf(eventName.toString())]+1
                if (playerCountList[codeList.indexOf(eventName.toString())] == 1) {
                    socket.emit(eventName, "hostPrivileges")
                } else {
                    socket.emit(eventName, "connected")
                }
                io.emit(eventName, [args[0], "joined"])
            }
            if (args[1] == "start" && playerCountList[codeList.indexOf(eventName.toString())] >= minPlayers) {
                startRankedify(eventName)
            }
        }
    })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

function startRankedify(code) {
    console.log("started game of rankedify at code " + code)
}