var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var bodyParser = require('body-parser')
var exphbs  = require('express-handlebars');
var routes = require("./routes/htmlRoutes.js")

var users = [];
var connections = [];
var strokes = [];

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
 
app.use(bodyParser.json({ type: 'application/*+json' }))

// parse some custom thing into a Buffer
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))

// parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/html' }))

server.listen(process.env.PORT || 3000, function(){
	console.log("Server Running")
});

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static('public'))
app.use("/", routes)

io.sockets.on("connection", function(socket){
	//Connect
	connections.push(socket);
	console.log("Connected: %s sockets connected", connections.length)

	//Disconnect
	socket.on("disconnect", function(data){
		users.splice(users.indexOf(socket.username), 1)
		updateUsernames();
		connections.splice(connections.indexOf(socket), 1)
		console.log("Disconnected: %s sockets connected", connections.length)

	})
	//Gets message from Jquery and sends it back
	socket.on("send message", function(data){
		io.sockets.emit("new message", {msg: data});
	})
	//Gets user from Jquery and sends it back
	socket.on("new user", function(data, cb){
		cb(true)
		socket.username = data;
		if (users.includes(socket.username)) {
			var random = Math.floor(Math.random() * 100000)
			socket.username += random.toString()
			users.push(socket.username)
			updateUsernames();
			// if (strokes.length > 0) {
			// 	socket.emit("get drawing", {line: strokes})
			// }

		} else {
			users.push(socket.username)
			updateUsernames();
			// if (strokes.length > 0) {
			// 	socket.emit("get drawing", {line: strokes})
			// }

		}
	})


	//Gets new line from Jquery and sends it back

	socket.on("new line", function(data) {
		
		strokes.push(data)
		console.log("This is data on new line: " + data)
		console.log("Strokes: " + strokes)
		
		sendLine()
	})

	socket.on("new dbline", function(data){
		strokes = [];
		for (var i = 0; i < data.length; i++){
			strokes.push(data[i])
		}
		sendLine()
	})

	//Clear button clicked 

	socket.on("clear line", function(data) {
		strokes = [];
		io.sockets.emit("cleared line")
	})
	//Undo button clicked
	socket.on("undo line", function(data){
		strokes.pop()
		sendLine()
	})

})

function updateUsernames() {

	io.sockets.emit("get users" , users);

}

function sendLine(){
	io.sockets.emit("send line", {line: strokes})
}