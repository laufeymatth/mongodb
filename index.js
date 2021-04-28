var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
var people = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

//var clients = 0;

io.on('connection', (socket) =>{
	updateNicknames();
	console.log('a user connected');
	gömulSkilaboð();
	/*clients++;
	io.sockets.emit('clientsChange', clients);*/
	socket.on('disconnect', () =>{
		people.splice(people.indexOf(socket.nickname), 1);
		updateNicknames();
		/*clients--;
		io.sockets.emit('clientsChange', clients);*/
		console.log('user disconnected')
	});

	socket.on('nickname',(data) => {
		socket.nickname = data;	
		people.push(socket.nickname);
		updateNicknames();	
	});

	socket.on('tilBaka', (e) =>{
		gömulSkilaboð();
	})

	function gömulSkilaboð(){
		  MongoClient.connect(url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db("chatServer");
		  dbo.collection("skilaboð").find({}).toArray((err, result) =>{
		  	if (err) throw err;
		    console.log(result);
		    socket.emit('chat_init', result);
		   });
		});
	}

	socket.on('filter', (data) => {
		MongoClient.connect(url, function(err, db){
			if (err) throw err;
			var dbo = db.db("chatServer");
			dbo.collection("skilaboð").find({'user': data}).toArray((err, result) =>{
				if (err) throw err;
				console.log(result);
				socket.emit('filter', result);
			});
		});
	});

	socket.on('typing', (data) => {
		socket.broadcast.emit('typing', {data:data, name:socket.nickname});
	});

	socket.on('chat message', (msg) => {
		io.emit('chat message', {msg:msg, name: socket.nickname});
		MongoClient.connect(url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db("chatServer");
		  var skilaboð = { user: socket.nickname, message: msg};
		  //create collection called customers
		  dbo.collection("skilaboð").insertOne(skilaboð, function(err, res){
		  	if (err) throw err;
		  })
		  console.log("1 document inserted");
		  db.close();
		});
	});

	function updateNicknames(){
		io.sockets.emit('usernames', people);
	}

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});