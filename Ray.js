var Ray = function (origin, endpoint) { return (function (self) {

  self.hits = [];
  self.nearestHit = null;

  self.origin    = origin || vec3.create();
  self.endpoint  = endpoint || vec3.create();

  // calculate and normalize direction
  self.direction = vec3.create();

  if (endpoint && origin) {
    vec3.subtract(self.direction, endpoint, origin);
    vec3.normalize(self.direction, self.direction);
  }

  self.addHit = function (h) {
    if (h != null) {
      if ( !self.nearestHit
          // check that t isn't within margin of error
          || ((h.t < self.nearestHit.t) && (h.t > 0.01)) ) {
        self.nearestHit = h;
      }
      self.hits.push(h);
    }
  }

  self.cast = function (geometry, baseShape) {
    var hit;

    geometry.forEach(function (shape) {
      if (!baseShape || shape != baseShape) {
        hit = shape.findHit(self);
        if (hit) {
          self.addHit(hit);
        }
      }
    });
  }

  self.isShadowCast = function (geometry, surfaceHit, distSquared) {
    var h, i, g, shape = surfaceHit.shape;

    for (i = 0; i < geometry.length; i++) {
      g = geometry[i];
      if (g == shape)
        continue;
      h = g.findHit(self);
      if (h != null) {
        // check that hit is not behind light
        if ((h.distance(self.origin) < distSquared)
            && h.t > 0.01) {
          self.hits.push(h);
          return true;
        }
      }
    }

    return null;
  }

  self.reflect = function (hit) {
    var n = vec3.create(), v = vec3.create();
    vec3.copy(n, hit.normal);
    vec3.copy(v, self.direction);
    vec3.normalize(v, v);
    var c = vec3.dot(n, v);

    var reflectedDirection = vec3.create();
    vec3.scaleAndAdd(reflectedDirection, v, n, -2*c);

    var r = Ray();
    vec3.copy(r.origin, hit.coord);
    vec3.normalize(r.direction, reflectedDirection);
    r.reflected = true;

    return r;
  }

  return self;

})(Object.create(null))};
