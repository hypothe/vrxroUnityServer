const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 4242;

const EControlState = { NONE: 'NONE', ROT_L: 'ROT_L', ROT_R: 'ROT_R', ROT_U: 'ROT_U', ROT_D: 'ROT_D', COLOR: 'COLOR' };

var currentState = EControlState.NONE;
var btnCount = 0;

// Unity side

// the app continuously polls the server to retrieve 
// the current state (rotate L/R/U/D, change color)
app.get("/unity", (req, res) => {
	console.log("Unity request.")
	res.send(currentState);
});

// User side

// the user will see an HTML page with 5 buttons
// pressing them will change the state
app.get("/user", (req, res) => {
	res.sendFile(__dirname + '/static/user.html')
});

// The socket receives an message each time an event is
// triggered in the html page passed to the user, in the
// case when a button is clicked.
// The 'name' of the last button pressed is saved as the
// current status
io.on("connection", (socket) => {
	console.log("User connected");

	socket.on("disconnect", () => {
		console.log("User disconnected")
	});

	socket.on("btnClick", (msg) => {
		btnCount++;
		
		if (msg.name in EControlState) {
			currentState = EControlState[msg.name];
		}
		else {
			currentState = EControlState.NONE;
		}
		console.log(currentState);

		io.emit('btnReply', btnCount);
	})
});

server.listen(port, () => {
	console.log("Server started.");
});