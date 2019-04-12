var Cylinder = function (radius, height, material, transform) { return (function (self) {

  self = Shape('Cylinder', material, transform);

  self.radius = radius;
  self.height = height;

  self.findHit = function (inRay) {
    var r = self.transformIncidentRay(inRay);

    var ts = [];

    var radiusSquared = self.radius * self.radius;
    var dx = r.direction[0], dy = r.direction[1], dz = r.direction[2];
    var ox = r.origin[0], oy = r.origin[1], oz = r.origin[2];

    var a = dx * dx + dz * dz;
    var b = 2 * ox * dx + 2 * oz * dz;
    var c = ox * ox + oz * oz - radiusSquared;

    var det = b * b - 4 * a * c;

    if (det < 0) return null;
    else if (det == 0) ts.push(-b / (2*a));
    else ts.push((-b - Math.sqrt(det)) / (2*a)),
         ts.push((-b + Math.sqrt(det)) / (2*a));

    var t;

    for (var ti = 0; ti < ts.length; ti++) {
      var possibleT = ts[ti];
      var y = oy + dy * possibleT;
      if (possibleT <= 0 || y < 0 || y > self.height) continue;
      if (!t || possibleT < t)
        t = possibleT;
    }

    if (!t) return null;

    var x = ox + dx * t;
    var y = oy + dy * t;
    var z = oz + dz * t;

    var normal = vec3.fromValues(x, 0, z);
    normal = self.transformNormal(normal);
    var point = vec3.fromValues(x, y, z);
    point = self.untransformCoordinate(point);

    return Hit(self, t, point, normal);
  }

  return self;

})(Object.create(null))}
