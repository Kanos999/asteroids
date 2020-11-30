var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {});
const PORT = process.env.PORT || 5000;

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.use(express.static(__dirname + '/client'));

server.listen(PORT);
console.log("Server started on port", PORT);






var playersList = [];
var bulletsList = [];
var asteroidsList = [];

for(var i=0; i<15; i++) {
	asteroidsList.push({
		size: 1,
		x: Math.random()*4000,
		y: Math.random()*2500,
		xToAdd: Math.random()*4-2,
		yToAdd: Math.random()*4-2,
		peak: [Math.random()*200, Math.random()*200, Math.random()*200, Math.random()*200, Math.random()*200]
	});
}


setInterval(function() {
	bulletsList.forEach(function(bulletElement) {
		bulletElement.x += bulletElement.xToAdd;
		bulletElement.y += bulletElement.yToAdd;
	});
	asteroidsList.forEach(function(asteroidElement) {
		asteroidElement.x += asteroidElement.xToAdd;
		asteroidElement.y += asteroidElement.yToAdd;
	});
}, 1000/34);



io.sockets.on("connection", function(socket) {
    console.log("We have a new client: " + socket.id);

    socket.on("start", function(data) {
        playersList.push({
			id: socket.id,
			name: data.name,
			x: data.x,
			y: data.y,
			r: 0
		});
    });

	socket.on("shoot", function(data) {
        bulletsList.push({
			id: socket.id,
			x: data.x,
			y: data.y,
			xToAdd: data.xToAdd,
			yToAdd: data.yToAdd,
			r: data.r
		});
    });


    socket.on("update", function(data) {
		playersList.forEach(function(element) {
			if(element.id === socket.id) {
				element.x += data.x;
				element.y += data.y;
				element.r = data.r;
			}
		});
		socket.emit("heartbeat", {players: playersList, bullets: bulletsList, asteroids: asteroidsList});
    });

    socket.on("disconnect", function() {
        console.log("Player disconnected", socket.id);
        playersList = playersList.filter(function(player) {
            return socket.id !== player.id;
        });
		bulletsList = bulletsList.filter(function(bullet) {
            return socket.id !== bullet.id;
        });
    });
});
