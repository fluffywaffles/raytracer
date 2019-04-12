var scene1 = Scene(256);

//scene1.enableAntialiasing(2);
scene1.reflectionDepth = 1;

var stretchedSphere = Sphere(greenPlastic);
stretchedSphere.scale(2, 1, 1);

var bigSphere     = Sphere(pearl);
bigSphere.scale(10);
bigSphere.translate(0, 0, -5);

var chromeSphere  = Sphere(chrome);
chromeSphere.scale(0.33);
chromeSphere.translate(1, 0, 1);

var sphere        = Sphere(turquoise);
sphere.scale(0.33);
sphere.translate(-.5, 1, 2);

bigSphere.reflectionEnabled = true;

var cube = Cube(brass);
cube.translate(-0.5, -2, -.5);
cube.scale(3, 1, 1);

var ground = GroundPlane(-2, pewter, emerald);

var cylinder = Cylinder(1, 1, redPlastic);
cylinder.translate(0, -2, 2);

var cylinderTop = Sphere(redPlastic);
cylinderTop.translate(0, -1, 2);

ground.reflectionEnabled = true;
cube.reflectionEnabled = true;

cylinder.pattern = function (coord) {
  return Math.sin(coord[0] * 20) > 0.5 ? greenPlastic : redPlastic;
}

cylinderTop.pattern = function (coord) {
  return ((Math.tan((coord[1] + coord[0]) * 10) > 0)
          && (Math.tan((coord[1] - coord[0]) * 10) > 0)) ? pewter : redPlastic;
}

stretchedSphere.pattern = function (coord) {
  return ((Math.tan(coord[0] * 20) > 0)
          && (Math.tan(coord[1] * 10) > 0)) ? greenPlastic : emerald;
}

sphere.pattern = function (coord) {
  return Math.random() > 0.5 ? turquoise : pearl;
}

chromeSphere.pattern = function (coord) {
  return Math.tan(coord[0] * 5) > 0 ? chrome : obsidian;
}

scene1.addGeometry(ground);
scene1.addGeometry(cylinderTop);
scene1.addGeometry(cylinder);
scene1.addGeometry(stretchedSphere);
scene1.addGeometry(chromeSphere);
scene1.addGeometry(cube);
scene1.addGeometry(sphere);
scene1.addGeometry(bigSphere);

var light  = Light(vec3.fromValues(0, 7, 3), vec3.fromValues(1.0, 25, 25))
var light2 = Light(vec3.fromValues(1, 0.5, 5.0), vec3.fromValues(0, 0, 20.0));
var light3 = Light(vec3.fromValues(2, 2, 5), vec3.fromValues(0, 4.0, 20.0));

scene1.addLight(light);
scene1.addLight(light2);
scene1.addLight(light3);
