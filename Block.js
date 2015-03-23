function Block(descr) {
    for (var property in descr) {
        this[property] = descr[property];
    }
    this.numVertices = 36;
    this.colorIndex = Math.floor(Math.random()*6);
    this.DROP_TIME = 1000;
    this.timer = this.DROP_TIME;
}

Block.prototype.render = function(spinX, spinY) {
    var ctm = mat4();
    ctm = mult(ctm, rotate(parseFloat(spinX), [1, 0, 0]));
    ctm = mult(ctm, rotate(parseFloat(spinY), [0, 1, 0])) ;

    // Hver teningur
    this.renderCube(ctm, this.x, this.y-this.blockSize-0.01, this.z);
    this.renderCube(ctm, this.x, this.y, this.z);
    this.renderCube(ctm, this.x, this.y+this.blockSize+0.01, this.z);
};

Block.prototype.renderCube = function(ctm, x, y, z) {
    var ctm1 = mult(ctm, translate(x, y, z));
    ctm1 = mult(ctm1, scale4(this.blockSize, this.blockSize, this.blockSize));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(ctm1));
    gl.drawArrays(gl.TRIANGLES, this.numVertices*this.colorIndex, this.numVertices);
};

Block.prototype.update = function(dt) {
    this.timer -= dt;
    if(this.timer <= 0) {
        this.timer = this.DROP_TIME;
        this.y -= this.blockSize;
    }
};