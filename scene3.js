var scene3 = Scene(256);

scene3.camera.eye = vec3.fromValues(2.5, .5, 2.5);
scene3.camera.focus = vec3.fromValues(0, -1, 0);
var cameraLight = Light(vec3.fromValues(0, 3, 2), vec3.fromValues(0.0, 10, 10));
scene3.camera.calculateLowerLeft()

var flatSphere = Sphere(chrome);
flatSphere.translate(0, 0, 0);
flatSphere.scale(1, 1, 0.2);
flatSphere.reflectionEnabled = true;

var cube = Cube(brass);
cube.reflectionEnabled = true;

var sphere2 = Sphere(greenPlastic);
sphere2.translate(0, 0, 3);
sphere2.reflectionEnabled = true;

flatSphere.pattern = function (coord) {
  var y = 0.25 * Math.sin(8 * coord[0]);
  if (coord[1] < y) return redPlastic;
  else return pewter;
}

var ground = GroundPlane(-1, pewter, ruby);
ground.reflectionEnabled = true;

scene3.addGeometry(ground);
scene3.addGeometry(flatSphere);
//scene3.addGeometry(cube);
scene3.addGeometry(sphere2);

var light = Light(vec3.fromValues(1, 8, 10));

scene3.addLight(light);
scene3.addLight(cameraLight);

scene3.reflectionDepth = 1;
//scene3.enableAntialiasing(1);

