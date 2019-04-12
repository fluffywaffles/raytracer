var scene4 = Scene(256);

var ground = GroundPlane(-2, chrome, emerald);

var cone = Cone(gold);
cone.translate(2, 0, 1);
cone.scale(1, 2, 1);

var reactor = Reactor(redPlastic);
reactor.translate(-2, -.5, 0);
reactor.scale(2);

reactor.pattern = function (coord) {
  return (Math.cos(2 * coord[2] - coord[1]) < 0) ? redPlastic : bronze;
}

var reactor2 = Reactor(greenPlastic);
reactor2.translate(0, 0, 0);
reactor2.rotate(Math.PI/4, vec3.fromValues(1, 0, 0));
reactor2.rotate(Math.PI/4, vec3.fromValues(0, 0, 1));

scene4.addGeometry(ground);
scene4.addGeometry(cone);
scene4.addGeometry(reactor);
scene4.addGeometry(reactor2);

var light = Light(vec3.fromValues(0, 2, 4));

scene4.addLight(light);
