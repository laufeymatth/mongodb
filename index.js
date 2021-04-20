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

	socket.on('typing', (data) => {
		socket.broadcast.emit('typing', {data:data, name:socket.nickname});
	});

	socket.on('chat message', (msg) => {
		io.emit('chat message', {msg:msg, name: socket.nickname});
	});

	function updateNicknames(){
		io.sockets.emit('usernames', people);
	}

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});