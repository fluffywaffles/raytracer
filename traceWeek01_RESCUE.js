// Vertex shader program----------------------------------
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';

// Fragment shader program--------------------------------
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +              // set default precision
  '#endif\n' +
  'uniform int u_isTexture; \n' +              // texture/not-texture flag
  'uniform sampler2D u_Sampler;\n' +            // our 2D texture-addr-maker
                              // (see initTextures() fcn below)
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  if(u_isTexture > 0) {  \n' +        // pixel color comes from texture-map,
  '     gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
  '  } \n' +
  '  else { \n' +                        // OR pixel color is just 'red'
  '      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0); \n' +
  '  } \n' +
  '}\n';

// 'Uniform' values (sent to the GPU)
var u_isTexture = 0;          // ==0 false--use fixed colors in frag shader
                    // ==1 true --use texture-mapping in frag shader
var u_isTextureID = 0;        // GPU location of this uniform var

// Global vars for mouse click-and-drag for rotation.
var isDrag=false;    // mouse-drag: true when user holds down mouse button
var xMclik=0.0;      // last mouse button-down position (in CVV coords)
var yMclik=0.0;
var xMdragTot=0.0;  // total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;

//-----------Ray Tracer Objects:

var scene = scene3;

function main() {
//==============================================================================
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  canvas.width = 600;
  canvas.height = 600;
  // (ignore the size settings from our HTML file; fill all but a 20-pixel
  // border with a canvas whose width is twice its height.)
  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Create,enable vertex buffer objects (VBO) in graphics hardware
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set up vertex buffer objects');
    return;
  }

  // Create, set uniform var to select fixed color vs texture map drawing:
  u_isTextureID = gl.getUniformLocation(gl.program, 'u_isTexture');
  if (!u_isTextureID) {
    console.log('Failed to get the GPU storage location of u_isTexture uniform');
    return false;
  }

  // Register the Mouse & Keyboard Event-handlers-------------------------------
  // If users move, click or drag the mouse, or they press any keys on the
  // the operating system will sense them immediately as 'events'.
  // If you would like your program to respond to any of these events, you must // tell JavaScript exactly how to do it: you must write your own 'event
  // handler' functions, and then 'register' them; tell JavaScript WHICH
  // events should cause it to call WHICH of your event-handler functions.
  //
  // First, register all mouse events found within our HTML-5 canvas:
  canvas.onmousedown  =  function(ev){myMouseDown( ev, gl, canvas) };

            // when user's mouse button goes down call mouseDown() function
  canvas.onmousemove =   function(ev){myMouseMove( ev, gl, canvas) };

                      // call mouseMove() function
  canvas.onmouseup =     function(ev){myMouseUp(   ev, gl, canvas)};
            // NOTE! 'onclick' event is SAME as on 'mouseup' event
            // in Chrome Brower on MS Windows 7, and possibly other
            // operating systems; use 'mouseup' instead.

  // Next, register all keyboard events found within our HTML webpage window:
  window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("keyup", myKeyUp, false);
  window.addEventListener("keypress", myKeyPress, false);
  // The 'keyDown' and 'keyUp' events respond to ALL keys on the keyboard,
  //       including shift,alt,ctrl,arrow, pgUp, pgDn,f1,f2...f12 etc.
  //      I find these most useful for arrow keys; insert/delete; home/end, etc.
  // The 'keyPress' events respond only to alpha-numeric keys, and sense any
  //      modifiers such as shift, alt, or ctrl.  I find these most useful for
  //      single-number and single-letter inputs that include SHIFT,CTRL,ALT.

  // END Mouse & Keyboard Event-Handlers-----------------------------------

  // Specify how we will clear the WebGL context in <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // gl.enable(gl.DEPTH_TEST); // CAREFUL! don't do depth tests for 2D!

  // Create, load, enable texture buffer object (TBO) in graphics hardware
  if (!initTextures(gl, n)) {
    console.log('Failed to intialize the texture object(s).');
    return;
  }
  // Draw the WebGL preview (right) and ray-traced result (left).
  drawAll(gl,n);
}

function initVertexBuffers(gl) {
//==============================================================================
// 4 vertices for a texture-mapped 'quad' (square) to fill almost all of the CVV
  var verticesTexCoords = new Float32Array([
    // Quad vertex coordinates(x,y in CVV); texture coordinates tx,ty
    -1.0,  1.0,     0.0, 1.0,        // upper left corner,
    -1.0, -1.0,     0.0, 0.0,        // lower left corner,
     1.0,  1.0,     1.0, 1.0,        // upper right corner,
     1.0, -1.0,     1.0, 0.0,        // lower left corner.
  ]);
  var n = 4; // The number of vertices

  // Create the vertex buffer object in the GPU
  var vertexTexCoordBufferID = gl.createBuffer();
  if (!vertexTexCoordBufferID) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the this vertex buffer object to target (ARRAY_BUFFER).
  // (Why 'ARRAY_BUFFER'? Because our array holds vertex attribute values.
  //  Our only other target choice: 'ELEMENT_ARRAY_BUFFER' for an array that
  // holds indices into another array that holds vertex attribute values.)
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBufferID);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;  // number of bytes/value
  //---------------------------
  //Get the GPU location of a_Position attribute; assign * enable buffer
  var a_PositionID = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_PositionID < 0) {
    console.log('Failed to get the GPU storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_PositionID,     // select the vertex attrib in the GPU
                          2,       // # of values per attrib (1,2,3, or 4)
                          gl.FLOAT,   // data-type of each value in this attrib
                          false,     // is this attrib already normalized?
                          FSIZE*4,   // stride: # of bytes from start of this
                                // attribute to the start of the next one
                          0);      // offset: # of bytes to the start of data
                              // in the buffer we use
  gl.enableVertexAttribArray(a_PositionID);
                                // Enable extraction of this attribute from
                                // the currently-bound buffer object=
  //---------------------------
  // Get the GPU location of a_TexCoord attribute: assign & enable buffer
  var a_TexCoordID = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoordID < 0) {
    console.log('Failed to get the GPU storage location of a_TexCoord');
    return -1;
  }
  // Assign the buffer object to a_TexCoord variable
  gl.vertexAttribPointer(a_TexCoordID,   // select the vertex attrib in the GPU
                          2,           // # of values per attrib (1,2,3, or 4)
                          gl.FLOAT,   // data-type of each value in this attrib
                          false,       // is this attrib already normalized?
                          FSIZE*4,     // stride: # of bytes from start of this
                                      // attribute to the start of the next one
                          FSIZE*2);    // offset: # of bytes to the start of data
  gl.enableVertexAttribArray(a_TexCoordID);
                                  // Enable extraction of this attribute from
                                  // the currently-bound buffer object
    //---------------------------
  return n;
}

function initTextures(gl, n) {
//==============================================================================
// set up the GPU to supply a texture image and pixel-by-pixel texture addresses
// for our Fragment Shader.
  var textureID = gl.createTexture();   // Get GPU location for new texture map
  if (!textureID) {
    console.log('Failed to create the texture object on the GPU');
    return false;
  }

  // Get GPU location of a new uniform u_Sampler
  var u_SamplerID = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_SamplerID) {
    console.log('Failed to get the GPU location of u_Sampler');
    return false;
  }

  // Enable texture unit0 for our use
  gl.activeTexture(gl.TEXTURE0);
  // Bind our texture object (made at start of this fcn) to GPU's texture hdwe.
  gl.bindTexture(gl.TEXTURE_2D, textureID);
  // allocate memory and load the texture image into our texture object on GPU:
  gl.texImage2D(gl.TEXTURE_2D,   //  'target'--the use of this texture
                0,               //  MIP-map level (default: 0)
                gl.RGB,         // GPU's data format (RGB? RGBA? etc)
                scene.buffer.xsize,      // image width in pixels,
                scene.buffer.ysize,      // image height in pixels,
                0,              // byte offset to start of data
                gl.RGB,         // source/input data format (RGB? RGBA?)
                gl.UNSIGNED_BYTE,   // data type for each color channel
                scene.buffer.image);  // data source.

  // Set the WebGL texture-filtering parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture unit 0 to be driven by the sampler
  gl.uniform1i(u_SamplerID, 0);
  return true;                  // done.
}

function refreshTextures(gl) {
//==============================================================================
// Modify/update the contents of the texture map(s) stored in the GPU;
// copy current contents of CImgBuf object 'myPic'  (see initTextures() above)
// into the existing texture-map object stored in the GPU:

  gl.texSubImage2D(gl.TEXTURE_2D,   //  'target'--the use of this texture
                0,               //  MIP-map level (default: 0)
                0,0,            // xoffset, yoffset (shifts the image)
                scene.buffer.xsize,      // image width in pixels,
                scene.buffer.ysize,      // image height in pixels,
                gl.RGB,         // source/input data format (RGB? RGBA?)
                gl.UNSIGNED_BYTE,   // data type for each color channel
                scene.buffer.image);  // data source.
}


function drawAll(gl,nV) {
//==============================================================================
// Clear <canvas> color AND DEPTH buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Use OpenGL/ WebGL 'viewports' to map the CVV to the 'drawing context',
  // (for WebGL, the 'gl' context describes how we draw inside an HTML-5 canvas)
  // Details? see
  //  https://www.khronos.org/registry/webgl/specs/1.0/#2.3
  //------------------------------------------
  // Draw in the LEFT viewport
  //------------------------------------------
  // CHANGE from our default viewport:
  // gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  // to a smaller one:
  /*gl.viewport(0,                              // Viewport lower-left corner
              0,                              // (x,y) location(in pixels)
              gl.drawingBufferWidth/2,         // viewport width, height.
              gl.drawingBufferHeight);
  // select fixed-color drawing:
  gl.uniform1i(u_isTextureID, 0);            // DON'T use texture,
  //gl.drawArrays(gl.LINE_STRIP, 0, nV);   // Draw a simple red Z shape, or
  gl.drawArrays(gl.LINES, 0, nV);      // or just 2 red lines, or
  // Now draw other stuff...
  gl.drawArrays(gl.LINES, nV, 0);

   //------------------------------------------
  // Draw in the RIGHT viewport:
  //------------------------------------------
  gl.viewport(gl.drawingBufferWidth/2,         // Viewport lower-left corner
              0,                               // location(in pixels)
              gl.drawingBufferWidth/2,         // viewport width, height.
              gl.drawingBufferHeight);*/

  gl.uniform1i(u_isTextureID, 1);            // DO use texture,
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, nV);   // Draw the textured rectangle
  //-----------------------------------------

}

//=================================//
//                                 //
//   Mouse and Keyboard            //
//   event-handling Callbacks      //
//                                 //
//=================================//


function myMouseDown(ev, gl, canvas) {
//==============================================================================
// Called when user PRESSES down any mouse button;
//                   (Which button?    console.log('ev.button='+ev.button);   )
//     ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
//    pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();  // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top);  // y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);

  // Convert to Canonical View Volume (CVV) coordinates too:
  // MODIFIED for side-by-side display: find position within the LEFT-side CVV
  var x = (xp - canvas.width/4)  /     // move origin to center of LEFT viewport,
               (canvas.width/4);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);
//  console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);

  isDrag = true;                      // set our mouse-dragging flag
  xMclik = x;                          // record where mouse-dragging began
  yMclik = y;
};

function myMouseMove(ev, gl, canvas) {
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
//                   (Which button?   console.log('ev.button='+ev.button);    )
//     ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
//    pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

  if(isDrag==false) return;        // IGNORE all mouse-moves except 'dragging'

  // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();  // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top);  // y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);

  // Convert to Canonical View Volume (CVV) coordinates too:
  // MODIFIED for side-by-side display: find position within the LEFT-side CVV
  var x = (xp - canvas.width/4)  /     // move origin to center of LEFT viewport,
               (canvas.width/4);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);
//  console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

  // find how far we dragged the mouse:
  xMdragTot += (x - xMclik);          // Accumulate change-in-mouse-position,&
  yMdragTot += (y - yMclik);
  xMclik = x;                          // Make next drag-measurement from here.
  yMclik = y;
};

function myMouseUp(ev, gl, canvas) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
//                   (Which button?   console.log('ev.button='+ev.button);    )
//     ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
//    pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();  // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top);  // y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);

  // Convert to Canonical View Volume (CVV) coordinates too:
  // MODIFIED for side-by-side display: find position within the LEFT-side CVV
  var x = (xp - canvas.width/4)  /     // move origin to center of LEFT viewport,
               (canvas.width/4);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);
  console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);

  isDrag = false;                      // CLEAR our mouse-dragging flag, and
  // accumulate any final bit of mouse-dragging we did:
  xMdragTot += (x - xMclik);
  yMdragTot += (y - yMclik);
  console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
};

function myKeyDown(ev) {
//===============================================================================
// Called when user presses down ANY key on the keyboard, and captures the
// keyboard's scancode or keycode(varies for different countries and alphabets).
//  CAUTION: You may wish to avoid 'keydown' and 'keyup' events: if you DON'T
// need to sense non-ASCII keys (arrow keys, function keys, pgUp, pgDn, Ins,
// Del, etc), then just use the 'keypress' event instead.
//   The 'keypress' event captures the combined effects of alphanumeric keys and // the SHIFT, ALT, and CTRL modifiers.  It translates pressed keys into ordinary
// UniCode or ASCII codes; you'll get the ASCII code for uppercase 'S' if you
// hold shift and press the 's' key.
// For a light, easy explanation of keyboard events in JavaScript,
// see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
// For a thorough explanation of the messy way JavaScript handles keyboard events
// see:    http://javascript.info/tutorial/keyboard-events
//
  console.log('myKeyDown()--charCode=', ev.charCode, ', keyCode=', ev.keyCode)

  document.getElementById('Result').innerHTML =
    'myKeyDown()--charCode=' + ev.charCode +', keyCode='+ev.keyCode;

  var step = .5

  switch(ev.keyCode) {      // keycodes !=ASCII, but are very consistent for
  //  nearly all non-alphanumeric keys for nearly all keyboards in all countries.
    case 37:    // left-arrow key
      // print in console:
      console.log(' left-arrow.');
      vec3.sub(scene.camera.eye, scene.camera.eye, vec3.fromValues(step, 0, 0));
      break;
    case 38:    // up-arrow key
      console.log('   up-arrow.');
      vec3.sub(scene.camera.eye, scene.camera.eye, vec3.fromValues(0, 0, step));
      break;
    case 39:    // right-arrow key
      console.log('right-arrow.');
      vec3.add(scene.camera.eye, scene.camera.eye, vec3.fromValues(step, 0, 0));
      break;
    case 40:    // down-arrow key
      console.log(' down-arrow.');
      vec3.add(scene.camera.eye, scene.camera.eye, vec3.fromValues(0, 0, step));
      break;
    case 87:
      //w
      vec3.add(scene.camera.focus, scene.camera.focus, vec3.fromValues(0, 0, step));
      break;
    case 65:
      //a
      vec3.sub(scene.camera.focus, scene.camera.focus, vec3.fromValues(step, 0, 0));
      break;
    case 83:
      //s
      vec3.sub(scene.camera.focus, scene.camera.focus, vec3.fromValues(0, 0, step));
      break;
    case 68:
      //d
      vec3.add(scene.camera.focus, scene.camera.focus, vec3.fromValues(step, 0, 0));
      break;
    case 81:
      //q
      vec3.sub(scene.camera.focus, scene.camera.focus, vec3.fromValues(0, step, 0));
      break;
    case 69:
      //e
      vec3.add(scene.camera.focus, scene.camera.focus, vec3.fromValues(0, step, 0));
      break;
    case 16:
      //shift
      console.log('shift.');
      vec3.add(scene.camera.eye, scene.camera.eye, vec3.fromValues(0, step, 0));
      break;
    case 17:
      //ctrl
      console.log('ctrl');
      vec3.sub(scene.camera.eye, scene.camera.eye, vec3.fromValues(0, step, 0));
      break;
    case 112:
      console.log('f1');
      ev.preventDefault();
      toggleHelp();
      break;
  }
}

var help = document.getElementById('help');
var tracing = document.getElementById('tracingStatus');

function toggleHelp () {
  var d = help.style.display;
  help.style.display = d == 'block' ? 'none' : 'block';
}

function toggleTracing () {
  var d = tracing.style.display;
  tracing.style.display = d == 'block' ? 'none' : 'block';
}

function myKeyUp(ev) {
//===============================================================================
// Called when user releases ANY key on the keyboard; senses ALL key changes.
//  Rarely needed.

//  console.log('myKeyUp()--keyCode='+ev.keyCode+' released.');

}

function myKeyPress(ev) {
//===============================================================================
// Best for capturing alphanumeric keys and key-combinations such as
// CTRL-C, alt-F, SHIFT-4, etc.
  var character = String.fromCharCode(ev.charCode);  // as a 1-char string;
  // Did user press the 't' or the 'T' key?
  var myCanvas = document.getElementById('webgl');  // get current canvas
  var myGL = getWebGLContext(myCanvas);        // and its current context:
  if(character == 't') {
    toggleTracing();
    setTimeout(function () {
      scene.camera.calculateLowerLeft();
      scene.render();
      refreshTextures(myGL);
      drawAll(myGL,4);
      toggleTracing();
    }, 1);
  }
}
