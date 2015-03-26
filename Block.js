var TYPE_LINE = 0;
var TYPE_L = 1;

function Block(descr) {
    for (var property in descr) {
        this[property] = descr[property];
    }
    this.numVertices = 36;
    this.colorIndex = Math.floor(Math.random()*6);
    this.DROP_TIME = 1000;
    this.timer = this.DROP_TIME;
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
    ctm = mult(ctm, rotate(parseFloat(spinY), [0, 1, 0])) ;

    this.calculateRenderLocation();
    // Hver teningur
    for(var i = 0; i < this.cubes.length; i++) {
        var dist = this.spaceBetween;
        this.renderCube(ctm, this.renderX + this.cubes[i][0]*dist, this.renderY + this.cubes[i][1]*dist, this.renderZ + this.cubes[i][2]*dist);
    }
};

Block.prototype.calculateRenderLocation = function() {
    this.spaceBetween = 2/BOARD_SIZE;
    this.renderX = (this.x-BOARD_SIZE/2)/(BOARD_SIZE/2);
    this.renderY = (this.y-BOARD_HEIGHT/2)/(BOARD_HEIGHT/2);
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
            this.timer = this.DROP_TIME;
            this.y -= 1;
            this.moved = true;
        } else {
            this.moved = false;
        }
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