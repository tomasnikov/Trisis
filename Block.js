var TYPE_LINE = 0;
var TYPE_L = 1;

function Block(descr) {
    for (var property in descr) {
        this[property] = descr[property];
    }
    this.numVertices = 36;
    this.colorIndex = Math.floor(Math.random()*6);
    this.timer = DROP_TIME;
    this.active = true;
    this.moved = false;
    this.type = Math.floor(Math.random()*2);
    if(this.type === TYPE_L) {
        this.cubes = [[0, 0, 0], [0, -1, 0], [0, 1, 0]];
    } else {
        this.cubes = [[0, 0, 0], [0, -1, 0], [1, 0, 0]];
    }
}

Block.prototype.render = function(spinX, spinY) {
    var ctm = lookAt( vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    ctm = mult(ctm, rotate(parseFloat(spinX), [1, 0, 0]));
    ctm = mult(ctm, rotate(parseFloat(spinY), [0, 1, 0]));

    this.calculateRenderLocation();
    // Hver teningur
    for(var i = 0; i < this.cubes.length; i++) {
        var dist = this.spaceBetween;
        this.renderCube(ctm, this.renderX + this.cubes[i][0]*dist, this.renderY + this.cubes[i][1]*dist, this.renderZ + this.cubes[i][2]*dist);
    }
};

Block.prototype.getCubeLocations = function() {
    var cubes = [];
    for(var i = 0; i < this.cubes.length; i++) {
        cubes.push([this.x + this.cubes[i][0], this.y + this.cubes[i][1], this.z + this.cubes[i][2]]);
    }
    return cubes;
};

Block.prototype.clearRow = function(y) {
    if(this.active) {
        return;
    }
    var removeCubes = [];
    for(var i = 0; i < this.cubes.length; i++) {
        if(this.cubes[i][1]+this.y == y) {
            removeCubes.push(i);
        } else if(this.cubes[i][1]+this.y > y) {
            this.cubes[i][1] -= 1;
        }
    }
    for(i = removeCubes.length-1; i >= 0; i--) {
        this.cubes.splice(removeCubes[i], 1);
    }
};

Block.prototype.calculateRenderLocation = function() {
    this.spaceBetween = 2/BOARD_SIZE;
    this.renderX = (this.x-BOARD_SIZE/2)/(BOARD_SIZE/2);
    this.renderY = (this.y-BOARD_HEIGHT/2)/(BOARD_SIZE/2);
    this.renderZ = (this.z-BOARD_SIZE/2)/(BOARD_SIZE/2);
};

Block.prototype.renderCube = function(ctm, x, y, z) {
    gl.bindTexture( gl.TEXTURE_2D, textures[this.colorIndex+1] );
    var ctm1 = mult(ctm, translate(x, y, z));
    ctm1 = mult(ctm1, scale4(this.spaceBetween, this.spaceBetween, this.spaceBetween));
    gl.uniformMatrix4fv(mvLoc, false, flatten(ctm1));
    gl.drawArrays(gl.TRIANGLES, this.numVertices*this.colorIndex, this.numVertices);
};

Block.prototype.update = function(dt) {
    if(this.active) {
        this.timer -= dt;
        if(this.timer <= 0) {
            this.timer = DROP_TIME;
            this.y -= 1;
            this.moved = true;
        } else {
            this.moved = false;
        }
    }
};

Block.prototype.dropDown = function() {
    if(this.active) {
        this.timer = DROP_TIME;
        this.y -= 1;
        this.moved = true;
    }
};

Block.prototype.land = function() {
    this.active = false;
    this.moved = false;
    this.y += 1;
};

Block.prototype.rotateZ = function(sign) {
    this.rotate(0, 1, sign);
};

Block.prototype.rotateY = function(sign) {
    this.rotate(0, 2, sign);
};

Block.prototype.rotateX = function(sign) {
    this.rotate(1, 2, sign);
};

Block.prototype.rotate = function(first, second, sign) {
    for(i = 0; i < this.cubes.length; i++) {
        var temp = this.cubes[i][second]*sign;
        this.cubes[i][second] = -this.cubes[i][first]*sign;
        this.cubes[i][first] = temp;
    }
};

Block.prototype.isOutsideBox = function() {
    for(var i = 0; i < this.cubes.length; i++) {
        if(this.y+this.cubes[i][1] < 0) {
            return true;
        }
    }
    var realCubeLocations = this.getCubeLocations();
    for(i = 0; i < realCubeLocations.length; i++) {
        if(realCubeLocations[i][0] < 0 || realCubeLocations[i][0] >= BOARD_SIZE ||
                realCubeLocations[i][2] < 0 || realCubeLocations[i][2] >= BOARD_SIZE) {
            return true;
        }
    }
    return false;
};

Block.prototype.checkCollision = function(cubes, x, y, z) {
    for(var i = 0; i < this.cubes.length; i++) {
        for(var j = 0; j < cubes.length; j++) {
            if(this.x+this.cubes[i][0] == x+cubes[j][0] && this.y+this.cubes[i][1] == y+cubes[j][1] && this.z+this.cubes[i][2] == z+cubes[j][2]) {
                return true;
            }
        }
    }

    return false;
};