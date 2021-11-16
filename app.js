const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 4242;

const EControlState = { NONE: 0, ROT_L: 1, ROT_R: 2, ROT_U: 3, ROT_D: 4, COLOR: 5 };

var currentState = EControlState.NONE;

app.get("/unity", (req, res) => {
	// Unity side

	// the app continuously polls the server to retrieve 
	// the current state (rotate L/R/U/D, change color)
});

app.get("/user", (req, res) => {
	// User side

	// the user will see an HTML page with 5 buttons
	// pressing them will change the state
	res.sendFile(__dirname + '/static/user.html')
});

io.on("connection", (socket) => {
	console.log("User connected");
	socket.on("disconnect", () => {
		console.log("User disconnected")
	});
});

server.listen(port, () => {
	console.log("Server started.");
});