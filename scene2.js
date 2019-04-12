var scene2 = Scene(256);
vec3.copy(scene2.camera.eye, vec3.fromValues(0, 1, 4));
//vec3.copy(scene2.camera.eye, vec3.fromValues(0, 3, 10));
scene2.camera.calculateLowerLeft();

var ground  = GroundPlane(-2, pewter, emerald);

var cube    = Cube(pearl);
cube.translate(-.5, 0, 0);
cube.scale(2);

var cube2   = Cube(redPlastic);
cube2.translate(-.5, 0, 2);
cube2.scale(2);

cube2.surfaces = ['front'];

cube.reflectionEnabled = true;
cube2.reflectionEnabled = true;

scene2.addGeometry(ground);
scene2.addGeometry(cube2);
scene2.addGeometry(cube);

var light = Light(vec3.fromValues(0, 5, 3));

scene2.addLight(light);

scene2.enableAntialiasing(1);
scene2.reflectionDepth = 4;
