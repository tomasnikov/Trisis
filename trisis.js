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

var zDist = 9;

var matrixLoc;
var program;

var blocks = [];
var textures = [];

var board = [];
initBoard();

var time = 0;
var prevTime = -1/60;

var gameOver = false;
var score = 0;
var messageElement;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    messageElement = document.getElementById("messages");

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
            if(isColliding(blocks.length-1)) {
                blocks[blocks.length-1].z -= 1;
            }
        }

        if(e.keyCode == 40 && blocks[blocks.length-1].z > 0) { // down
            blocks[blocks.length-1].z -= 1;
            if(isColliding(blocks.length-1)) {
                blocks[blocks.length-1].z += 1;
            }
        }

        if(e.keyCode == 37 && blocks[blocks.length-1].x > 0) {
            blocks[blocks.length-1].x -= 1;
            if(isColliding(blocks.length-1)) {
                blocks[blocks.length-1].x += 1;
            }
        }

        if(e.keyCode == 39) {
            blocks[blocks.length-1].x += 1;
            if(isColliding(blocks.length-1)) {
                blocks[blocks.length-1].x -= 1;
            }
        }

        if(e.keyCode == 32) {
            if(!gameOver) {
                while(!isColliding(blocks.length-1)) {
                    blocks[blocks.length-1].dropDown();
                }
                landBlock(blocks.length-1);
            } else {
                reset();
            }
        }

        if(String.fromCharCode(e.keyCode) === "D") {
            blocks[blocks.length-1].rotateZ(1);
            if(isColliding(blocks.length-1)) {
                blocks[blocks.length-1].rotateZ(-1);
            }
        }

        if(String.fromCharCode(e.keyCode) === "C") {
            blocks[blocks.length-1].rotateZ(-1);
            if(isColliding(blocks.length-1)) {
                blocks[blocks.length-1].rotateZ(1);
            }
        }

        if(String.fromCharCode(e.keyCode) === "S") {
            blocks[blocks.length-1].rotateY(1);
            if(isColliding(blocks.length-1)) {
                blocks[blocks.length-1].rotateY(-1);
            }
        }

        if(String.fromCharCode(e.keyCode) === "X") {
            blocks[blocks.length-1].rotateY(-1);
            if(isColliding(blocks.length-1)) {
                blocks[blocks.length-1].rotateY(1);
            }
        }

        if(String.fromCharCode(e.keyCode) === "A") {
            blocks[blocks.length-1].rotateX(1);
            if(isColliding(blocks.length-1)) {
                blocks[blocks.length-1].rotateX(-1);
            }
        }

        if(String.fromCharCode(e.keyCode) === "Z") {
            blocks[blocks.length-1].rotateX(-1);
            if(isColliding(blocks.length-1)) {
                blocks[blocks.length-1].rotateX(1);
            }
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

function reset() {
    initBoard();
    blocks = [];
    spawnBlock();
    gameOver = false;
}

function initBoard() {
    board = [];
    for(var y = 0; y < BOARD_HEIGHT; y++) {
        board.push([]);
        for(var x = 0; x < BOARD_SIZE; x++) {
            board[y].push([]);
            for(var z = 0; z < BOARD_SIZE; z++) {
                board[y][x].push(0);
            }
        }
    }
}

function render(time) {
    if(!gameOver) {
        var dt = time - prevTime;
        prevTime = time;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (var i = 0; i < blocks.length; i++) {
            blocks[i].update(dt);

            // If block moved we check for collision and undo its motion if needed
            if(blocks[i].moved) {
                var collided = isColliding(i);

                if(collided) {
                    landBlock(i);
                }
            }

            blocks[i].render(spinX, spinY);
        }
    }

    messageElement.textContent = "Score: " + score;
    if(gameOver) {
        messageElement.textContent += " - Game over! Press space to restart";
    }

    requestAnimFrame(render);
}

function landBlock(blockIndex) {
    blocks[blockIndex].land();
    addBlock(blocks[blockIndex]);
    spawnBlock();
    checkRows();
}

function isColliding(blockIndex) {
    var collided = false;
    for(var k = 0; k < blocks.length; k++) {
        if(k != blockIndex) {
            collided = collided || blocks[blockIndex].checkCollision(blocks[k].cubes, blocks[k].x, blocks[k].y, blocks[k].z);
        }
    }
    if(blocks[blockIndex].isOutsideBox()) {
        collided = true;
    }

    return collided;
}

function checkRows() {
    var rowCleared = 0;
    for(var y = 0; y < BOARD_HEIGHT; y++) {
        if(isRowFull(y)) {
            rowCleared++;
            clearRow(y);
            y--;
        }
    }
    score += rowCleared*rowCleared*100
}

function addBlock(block) {
    var cubes = block.getCubeLocations();
    for(var i = 0; i < cubes.length; i++) {
        if(cubes[i][1] >= BOARD_HEIGHT) {
            gameOver = true;
        } else {
            board[cubes[i][1]][cubes[i][0]][cubes[i][2]] = 1;
        }
    }
}

function isRowFull(y) {
    for(var x = 0; x < BOARD_SIZE; x++) {
        for(var z = 0; z < BOARD_SIZE; z++) {
            if(board[y][x][z] === 0) {
                return false;
            }
        }
    }
    return true;
}

function clearRow(y) {
    console.log("clearing row " + y);
    // Let blocks know so they can render correctly
    for(var k = 0; k < blocks.length; k++) {
        this.blocks[k].clearRow(y);
    }

    // Correct the board array
    var x,z;
    // Move everyone down a level
    for(var i = y; i < BOARD_HEIGHT-1; i++) {
        for(x = 0; x < BOARD_SIZE; x++) {
            for(z = 0; z < BOARD_SIZE; z++) {
                board[i][x][z] = board[i+1][x][z];
            }
        }
    }
    // Empty top layer
    for(x = 0; x < BOARD_SIZE; x++) {
        for(z = 0; z < BOARD_SIZE; z++) {
            board[BOARD_HEIGHT-1][x][z] = 0;
        }
    }
}

function spawnBlock() {
    blocks.push(new Block({
        x: 3,
        y: BOARD_HEIGHT,
        z: 3,
    }));
}
