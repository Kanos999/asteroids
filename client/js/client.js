var socket;

var player;
var playersList = [];
var bulletsList = [];
var starsList = [];
var asteroidsList = [];

var rotation = 0;
var velocityX = 0;
var velocityY = 0;
var frict = 0.99;
var maxVel = 12;



var xLineOffset = 0;
var yLineOffset = 0;
var bg;

var centerVector;
var myVector;
var opponentVector;
var bulletVector;
var starVector;
var asteroidVector;
var myPos;

var inGame = false;



function setup() {
// Start a socket connection to the server
// Some day we would run this server somewhere else
    socket = io.connect();

    $("#button").click(function() {
        if (!$("#nameInput").val()) {
            alert("Name Empty");
            return;
        }
        inGame = true;
        $("#button").hide();
        $("#nameInput").hide();
        $("body").css({"background-color": "rgba(0,0,0,0.9)"});


        createCanvas(windowWidth, windowHeight);

        socket.emit("start", {
            name: $("#nameInput").val(),
            x: random(4000),
            y: random(2500)
        });
    });

    socket.on("heartbeat", function(data) {
        playersList = data.players;
        bulletsList = data.bullets;
        asteroidsList = data.asteroids;
        //console.log(data);
    });
    frameRate(34);

    for(var i=0; i<200; i++) {
        starsList.push({
            x: random(4000),
            y: random(2500),
            size: random(1)
        });
    }

}




function draw() {
    if(inGame) {
        clear();

        centerVector = createVector(width/2, height/2);

        drawStars();
        drawPlayers();
        drawBullets();
        drawAsteroids();



        if(keyIsDown(LEFT_ARROW)) {
            rotation += -0.12;
        }
        if(keyIsDown(RIGHT_ARROW)) {
            rotation += 0.12;
        }
        if(keyIsDown(UP_ARROW)) {
            xyVelocity();
        }
        update();
    }
}

function xyVelocity(){
    velocityX += 0.2 * sin(rotation); //* friction;
    velocityY += 0.2 * -cos(rotation); //* friction;
    if(velocityX > maxVel){
        velocityX = maxVel;
    }
    if(velocityY > maxVel){
        velocityY = maxVel;
    }
}

function update() {
    socket.emit("update", {
        x: velocityX,
        y: velocityY,
        r: rotation
    });


    velocityX *= frict;
    velocityY *= frict;
}


function keyPressed() {
    if(keyCode === 90) {
        socket.emit("shoot", {
            id: socket.id,
            x: myPos.x + sin(myPos.r) * 60,
            y: myPos.y + -cos(myPos.r) * 60,
            xToAdd: sin(myPos.r) * 30,
            yToAdd: -cos(myPos.r) * 30,
            r: myPos.r
        });
    }
}



function drawPlayers() {
    playersList.forEach(function(element) {
        if (element.id === socket.id) {
            myPos = {x: element.x, y: element.y, r: element.r};
            myVector = centerVector.sub(createVector(element.x, element.y));
            push();
            fill(255);
            strokeWeight(2);
            stroke(200);
            translate(width/2, height/2);
            rotate(element.r);
            quad(-20, 20, 0, 12, 20, 20, 0, -20);
            pop();
        }
    });

    playersList.forEach(function(element) {
        if (element.id !== socket.id) {
            opponentVector = createVector(element.x, element.y).add(myVector);
            fill(255);
            textSize(16);
            textAlign(CENTER);
            text(element.name, opponentVector.x, opponentVector.y + 48);
            push();
            stroke(150);
            fill(100);
            translate(opponentVector.x, opponentVector.y);
            rotate(element.r);
            quad(-20, 20, 0, 12, 20, 20, 0, -20);
            pop();
        }
    });
}

function drawBullets() {
    bulletsList.forEach(function(element) {
        bulletVector = createVector(element.x, element.y).add(myVector);
        push();
        fill(200,120,120);
        ellipse(bulletVector.x, bulletVector.y, 20);
        pop();
    });
}


function drawStars() {
    starsList.forEach(function(element) {
        starVector = createVector(element.x, element.y).add(myVector).mult(element.size);
        push();
        strokeWeight(0);
        fill(255*element.size);
        ellipse(starVector.x, starVector.y, 10*element.size);
        pop();
    });
}


function drawAsteroids() {
    asteroidsList.forEach(function(element) {
        asteroidVector = createVector(element.x, element.y).add(myVector);

        var asteroid = new Asteroid(asteroidVector.x, asteroidVector.y, element.peak);

        asteroid.draw();
        /*
        beginShape();
        vertex(element.pos[0], element.pos[1]);
        vertex(element.pos[2], element.pos[3]);
        vertex(element.pos[4], element.pos[5]);
        vertex(element.pos[6], element.pos[7]);
        vertex(element.pos[8], element.pos[9]);
        endShape(CLOSE);
        */
    });
}

function Asteroid(x, y, peak) {
    this.draw = function() {
        push();
        translate(x, y);
        noFill();
        stroke(255);
        beginShape();
        vertex(findVertex(peak, 0, true), findVertex(peak, 0, false));
        vertex(findVertex(peak, 1, true), findVertex(peak, 1, false));
        vertex(findVertex(peak, 2, true), findVertex(peak, 2, false));
        vertex(findVertex(peak, 3, true), findVertex(peak, 3, false));
        vertex(findVertex(peak, 4, true), findVertex(peak, 4, false));
        endShape(CLOSE);
        pop();
    };
}

function findVertex(peak, i, x) {
    var myVertex = createVector(0, peak[i]);
    myVertex.rotate(i * PI/3);
    return (x ? myVertex.x : myVertex.y);
}
