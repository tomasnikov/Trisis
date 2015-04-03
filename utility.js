function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function colorGrid()
{
    grid( 1, 0, 3, 2, BOARD_HEIGHT );
    grid( 2, 3, 7, 6, BOARD_HEIGHT );
    grid( 3, 0, 4, 7, BOARD_SIZE );
    grid( 6, 5, 1, 2, BOARD_SIZE );
    grid( 4, 5, 6, 7, BOARD_HEIGHT );
    grid( 5, 4, 0, 1, BOARD_HEIGHT );
}

function quad(a, b, c, d) {
    var vertices = [
        vec3(-0.5, -0.5,  0.5),
        vec3(-0.5,  0.5,  0.5),
        vec3( 0.5,  0.5,  0.5),
        vec3( 0.5, -0.5,  0.5),
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5,  0.5, -0.5),
        vec3( 0.5,  0.5, -0.5),
        vec3( 0.5, -0.5, -0.5)
    ];

    var texCo = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [a, b, c, a, c, d];
    var texind  = [ 1, 0, 3, 1, 3, 2 ];

    for (var i = 0; i < indices.length; ++i) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );
        texCoords.push( texCo[texind[i]] );
        // for solid colored faces use 
    }
}

function grid(a, b, c, d, e) 
{
    var vertices = [
        vec3( -BOARD_SIZE/4, -BOARD_HEIGHT/4,  BOARD_SIZE/4 ),
        vec3( -BOARD_SIZE/4,  BOARD_HEIGHT/4,  BOARD_SIZE/4 ),
        vec3(  BOARD_SIZE/4,  BOARD_HEIGHT/4,  BOARD_SIZE/4 ),
        vec3(  BOARD_SIZE/4, -BOARD_HEIGHT/4,  BOARD_SIZE/4 ),
        vec3( -BOARD_SIZE/4, -BOARD_HEIGHT/4, -BOARD_SIZE/4 ),
        vec3( -BOARD_SIZE/4,  BOARD_HEIGHT/4, -BOARD_SIZE/4 ),
        vec3(  BOARD_SIZE/4,  BOARD_HEIGHT/4, -BOARD_SIZE/4 ),
        vec3(  BOARD_SIZE/4, -BOARD_HEIGHT/4, -BOARD_SIZE/4 )
    ];

    var texCo = [
        vec2(0, 0),
        vec2(0, e),
        vec2(BOARD_SIZE, e),
        vec2(BOARD_SIZE, 0)
    ];

    //vertex texture coordinates assigned by the index of the vertex
    var indices = [ a, b, c, a, c, d ];
    var texind  = [ 1, 0, 3, 1, 3, 2 ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        texCoords.push( texCo[texind[i]] );
    }
}

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
//    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
//    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    return texture;
}

//----------------------------------------------------------------------------
// Define the transformation scale here (two scale functions in MV.js)
function scale4(x, y, z) {
    if (Array.isArray(x) && x.length == 3) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    var result = mat4();
    result[0][0] = x;
    result[1][1] = y;
    result[2][2] = z;

    return result;
}

function setupGL() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    matrixLoc = gl.getUniformLocation(program, "rotation");

    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    var proj = perspective( 50.0, 1.0, 0.2, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    
    for(var i = 1; i<=6; i++){
        textures[i] = configureTexture(document.getElementById("texImage" + i));
    }

    textureGrid = configureTexture(document.getElementById("texImageGrid"));
    
}