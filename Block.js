function Block(descr) {
    for (var property in descr) {
        this[property] = descr[property];
    }
}

Block.prototype.render = function(spinX, spinY) {
    var ctm = mat4();
    ctm = mult(ctm, rotate(parseFloat(spinX), [1, 0, 0]));
    ctm = mult(ctm, rotate(parseFloat(spinY), [0, 1, 0])) ;

    // Hver teningur
    this.renderCube(ctm, this.x, this.y-0.51, this.z);
    this.renderCube(ctm, this.x, this.y, this.z);
    this.renderCube(ctm, this.x, this.y+0.51, this.z);
};

Block.prototype.renderCube = function(ctm, x, y, z) {
    var ctm1 = mult(ctm, translate(x, y, z));
    ctm1 = mult(ctm1, scale4(0.5,0.5,0.5));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(ctm1));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
};