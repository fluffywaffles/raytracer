var Plane = function (ypos, material, transform) { return (function (self) {

  self = Shape('Plane', material, transform);

  self.findHit = function (inRay) {
    var r = self.transformIncidentRay(inRay);

    var color;

    var t = (-r.origin[1])/r.direction[1];

    if (t <= 0) return null;

    var coord = vec3.create();
    vec3.scaleAndAdd(coord, r.origin, r.direction, t);
    coord = self.untransformCoordinate(coord);

    var normal = vec3.fromValues(0, 1, 0);
    normal = self.transformNormal(normal);

    return Hit(self, t, coord, normal);
  }

  return self;

})(Object.create(null))};

var GroundPlane = function (ypos, gapMaterial, lineMaterial) {
  var p = Plane(ypos, gapMaterial);

  p.translate(0, ypos, 0);

  p.pattern = function (coord) {
    if (((Math.floor(coord[0]) % 2 == 0) && (coord[0] - Math.floor(coord[0]) < 0.3))|| ((Math.floor(coord[2]) % 2 == 0)
         && (coord[2] - Math.floor(coord[2]) < 0.3)))
      return lineMaterial;
    else return gapMaterial;
  }

  return p;
}
