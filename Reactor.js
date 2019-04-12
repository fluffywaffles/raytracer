var Reactor = function (material, transform) { return (function (self) {

  self = Shape('Reactor', material, transform);

  self.radius = 1;
  self.height = 1;

  self.findHit = function (inRay) {
    var r = self.transformIncidentRay(inRay);

    var ts = [];

    var dx = r.direction[0], dy = r.direction[1], dz = r.direction[2];
    var ox = r.origin[0], oy = r.origin[1], oz = r.origin[2];

    var a = dx * dx + dz * dz - dy * dy;
    var b = 2 * (ox * dx + oz * dz - dy * oy);
    var c = ox * ox + oz * oz - (oy * oy + self.radius * self.radius);

    var det = b * b - 4 * a * c;

    if (det < 0) return null;
    else if (det == 0) ts.push(-b / (2*a));
    else ts.push((-b - Math.sqrt(det)) / (2*a)),
         ts.push((-b + Math.sqrt(det)) / (2*a));

    var t;

    for (var ti = 0; ti < ts.length; ti++) {
      var possibleT = ts[ti];
      var y = oy + dy * possibleT;
      if (possibleT <= 0 || y > self.height/2 || y < -self.height/2) continue;
      if (!t || possibleT < t)
        t = possibleT;
    }

    if (!t) return null;

    var x = ox + dx * t;
    var y = oy + dy * t;
    var z = oz + dz * t;

    var point = vec3.fromValues(x, y, z);
    point = self.untransformCoordinate(point);

    var normalEndpoint = vec3.fromValues(2 * x, 0, 2 * z);
    var normal = vec3.subtract(vec3.create(), normalEndpoint, point);
    normal = self.transformNormal(normal);
    vec3.normalize(normal, normal);

    return Hit(self, t, point, normal);
  }

  return self;

})(Object.create(null))}
