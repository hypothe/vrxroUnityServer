const express = require("express");

const app = express();
const port = 4242;
const host = "192.168.40.93";

app.get("/:id", (req, res) => {
	let customObj = { userid: req.params["id"], value: 0 };
	res.json(customObj
	);
});

app.listen(port, () => {
	console.log("Server started.");
});