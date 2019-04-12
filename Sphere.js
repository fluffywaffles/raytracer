var Sphere = function (material) { return (function (self) {

  // NOTE(jordan): inherit from Shape
  self = Shape('Sphere', material);

  // center and radius are primarily aliases for translate and scale
  self.center = vec3.create();
  self.radius = 1;

  var coord = vec3.create(),
      normal = vec3.create(),
      rayToSphere = vec3.create();

  self.findHit = function (inRay) {
    var smallestR = Math.min.apply(Math, [].filter.call(self.scaling, function(s) { return s > 0}));
    if (smallestR < 1) {
      mat4.scale(self.scaling, self.scaling, vec3.fromValues(1/smallestR, 1/smallestR, 1/smallestR));
      self.radius = smallestR;
    }
    // Translate, scale, skew, rotate...
    var r = self.transformIncidentRay(inRay);

    var t, color;

    vec3.scale(rayToSphere, r.origin, -1);

    var distSquared = vec3.squaredLength(rayToSphere);
    var radiusSquared = self.radius * self.radius;

    // If rayAngle is negative, then cos(theta) is negative, 180 < theta < 90
    // That is, the sphere is behind the ray.
    // Direction is normalized, so this gives us the projection.
    // a dot b = ||a|| ||b|| cos ( theta ), where we know ||a|| = 1
    //var distToChordMid = vec3.dot(rayToSphere, inRay.direction);
    var distToChordMid = vec3.dot(rayToSphere, r.direction);

    if ((distSquared > radiusSquared) && distToChordMid < 0) {
      // oy, the sphere is behind the ray
      return null;
    }

    // now pythagorean to get centerToMidpoint distance squared
    var cToMidSquared = distSquared - distToChordMid * distToChordMid;

    if (cToMidSquared > radiusSquared) {
      // oy, the ray doesn't touch
      return null;
    }

    var chordHalfLength = Math.sqrt(radiusSquared - cToMidSquared);

    if (distSquared > radiusSquared) {
      // there are two hits, take the one with shorter distance
      t = distToChordMid - chordHalfLength;
    } else {
      // The ray started inside the sphere
      t = distToChordMid + chordHalfLength;
    }

    vec3.scaleAndAdd(coord, r.origin, r.direction, t);
    coord = self.untransformCoordinate(coord);

    vec3.copy(normal, coord);

    normal = self.transformNormal(normal);

    vec3.normalize(normal, normal);

    return Hit(self, t, coord, normal);
  }

  return self;

})(Object.create(null))}
