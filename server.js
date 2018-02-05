var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var exphbs  = require('express-handlebars');
var routes = require("./routes/htmlRoutes.js")

var users = [];
var connections = [];

server.listen(process.env.PORT || 3000, function(){
	console.log("Server Running")
});

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static('public'))
app.use("/", routes)

io.sockets.on("connection", function(socket){

	connections.push(socket);
	console.log("Connected: %s sockets connected", connections.length)

	//Disconnect
	socket.on("disconnect", function(data){
		users.splice(users.indexOf(socket.username), 1)
		updateUsernames();
		connections.splice(connections.indexOf(socket), 1)
		console.log("Disconnected: %s sockets connected", connections.length)

	})
	
	socket.on("send message", function(data){
		io.sockets.emit("new message", {msg: data});
	})

	socket.on("new user", function(data, cb){
		cb(true)
		socket.username = data;
		users.push(socket.username)
		updateUsernames();
	})

	socket.on("new line", function(data) {
		console.log(data)
		io.sockets.emit("send line", {line: data})
	})

	socket.on("clear line", function(data) {
		console.log(data)
		io.sockets.emit("cleared line")
	})


	function updateUsernames() {

		io.sockets.emit("get users" , users);
	}
})