var canvas;
var gl;

var points = [];
var colors = [];
var texCoords = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [0, 0, 0];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;
var moveUp = 30;

var zDist = 5;

var matrixLoc;
var program;

var blocks = [];
var textures = [];

var time = 0;
var prevTime = -1/60;

var gameOver = false;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL( canvas );
    if (!gl) { alert("WebGL isn't available"); }

    // create cubes in all colors
    for (var i = 0; i < 6; i++) {
        colorCube(i);
    }

    spawnBlock();

    setupGL();

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e) {
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    });

    canvas.addEventListener("mouseup", function(e) {
        movement = false;
    });

    canvas.addEventListener("mousemove", function(e) {
        if(movement) {
    	    spinY = (spinY + (origX - e.offsetX)) % 360;
            spinX = (spinX + (origY - e.offsetY)) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    });

    window.addEventListener("keydown", function(e) {
        if(e.keyCode == 38 && blocks[blocks.length-1].z < BOARD_SIZE-1) { // up
            blocks[blocks.length-1].z += 1;
        }

        if(e.keyCode == 40 && blocks[blocks.length-1].z > 0) { // down
            blocks[blocks.length-1].z -= 1;
        }

        if(e.keyCode == 37  && blocks[blocks.length-1].x > 0) {
            blocks[blocks.length-1].x -= 1;
        }

        if(e.keyCode == 39  && blocks[blocks.length-1].x < BOARD_SIZE-1) {
            blocks[blocks.length-1].x += 1;
        }

        if(e.keyCode == 32) {
            while(!isColliding(blocks.length-1)) {
                blocks[blocks.length-1].dropDown();
            }
        }

        if(String.fromCharCode(e.keyCode) === "D") {
            blocks[blocks.length-1].rotateZ(1);
        }

        if(String.fromCharCode(e.keyCode) === "C") {
            blocks[blocks.length-1].rotateZ(-1);
        }

        if(String.fromCharCode(e.keyCode) === "S") {
            blocks[blocks.length-1].rotateY(1);
        }

        if(String.fromCharCode(e.keyCode) === "X") {
            blocks[blocks.length-1].rotateY(-1);
        }

        if(String.fromCharCode(e.keyCode) === "A") {
            blocks[blocks.length-1].rotateX(1);
        }

        if(String.fromCharCode(e.keyCode) === "Z") {
            blocks[blocks.length-1].rotateX(-1);
        }

        if(String.fromCharCode(e.keyCode) === "Q") {
            gameOver = true;
        }
    });

    // Event listener for mousewheel
    window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zDist += 0.2;
         } else {
             zDist -= 0.2;
         }
     }  );  
    
    render(0);
};

function render(time) {
    if(gameOver) {
        console.log("game over");
        return;
    }

    var dt = time - prevTime;
    prevTime = time;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (var i = 0; i < blocks.length; i++) {
        blocks[i].update(dt);

        // If block moved we check for collision and undo its motion if needed
        if(blocks[i].moved) {
            var collided = isColliding(i);

            if(collided) {
                blocks[i].land();
                spawnBlock();
            }
        }

        blocks[i].render(spinX, spinY);
    }

    requestAnimFrame(render);
}

function isColliding(blockIndex) {
    var collided = false;
    for(var k = 0; k < blocks.length; k++) {
        if(k != blockIndex) {
            collided = collided || blocks[blockIndex].checkCollision(blocks[k].cubes, blocks[k].x, blocks[k].y, blocks[k].z);
        }
    }
    if(blocks[blockIndex].isBelow()) {
        collided = true;
    }

    return collided;
}

function spawnBlock() {
    blocks.push(new Block({
        x: 3,
        y: BOARD_HEIGHT,
        z: 3,
    }));
}
