var Camera = function (eye, focus, up, xsize, ysize) { return (function (self) {
  arguments = [].slice.call(arguments);

  self.eye   = eye;
  self.focus = focus;
  self.up    = up;

  self.xsize = xsize;
  self.ysize = ysize;

  // Make sure to normalize UP vector
  vec3.normalize(self.up, self.up);

  // Create look vector
  self.look = vec3.create();
  vec3.subtract(self.look, eye, focus);
  vec3.normalize(self.look, self.look);

  // UV-plane vectors
  self.u = vec3.create();
  self.v = vec3.create();

  vec3.copy(self.v, self.up);
  // Since UP and look are normalized, u shouldn't need to be
  vec3.cross(self.u, self.up, self.look);

  // UV-boundary weights
  var l = -0.66, r = 0.66,
      b = -0.66, t = 0.66,
      near = -0.66;

  // UV temporary vectors
  var lbound = vec3.create(),
      bbound = vec3.create(),
      uvNear = vec3.create();

  self.lowerleft = vec3.create();

  self.calculateLowerLeft = function () {
    vec3.subtract(self.look, self.eye, self.focus);
    vec3.normalize(self.look, self.look);

    vec3.copy(self.v, self.up);
    vec3.cross(self.u, self.up, self.look);

    // Get the lower left bound
    vec3.scale(lbound, self.u, l);
    vec3.scale(bbound, self.v, b);
    vec3.add(self.lowerleft, lbound, bbound);
    // Move it to the correct 'NEAR' position
    vec3.scale(uvNear, self.look, near);
    vec3.add(uvNear, uvNear, self.eye);
    vec3.add(self.lowerleft, self.lowerleft, uvNear);
  }

  self.calculateLowerLeft();

  self.ustep = (r - l) / self.xsize;
  self.vstep = (t - b) / self.ysize;

  self.antialiasingMode = 1;

  var AntiAliaser = function (step) {
    return function (aaidx) {
      var scatter = 1 / self.antialiasingMode;
      // randomly sample from points that are sampled from `scatter` sized
      // "subpixels" --- aka sub buffer points, may actually be closer to pixels

      // if antialiasing is diabled
      if (! (self.antialiasingMode > 1)) {
        // just get the exact offset
        return step * aaidx;
      }
      // otherwise get the step offset - boundary of the subwindow
      return scatter * Math.random() * step;
    }
  }

  self.uSamp = AntiAliaser(self.ustep);
  self.vSamp = AntiAliaser(self.vstep);

  var uvPatchSample = vec3.create();
  var uvPatchCenter = vec3.create();

  self.eyeRays = function(i, j) {
    var rays = [];

    vec3.scaleAndAdd(uvPatchCenter, self.lowerleft, self.u, self.ustep * i);
    vec3.scaleAndAdd(uvPatchCenter, uvPatchCenter, self.v, self.vstep * j);
    // uvPatchCenter is the sampling center

    for (var aa = 0; aa < self.antialiasingMode; aa++) {
      for (var ab = 0; ab < self.antialiasingMode; ab++) {
        vec3.scaleAndAdd(uvPatchSample, uvPatchCenter, self.u, self.uSamp(aa));
        vec3.scaleAndAdd(uvPatchSample, uvPatchSample, self.v, self.vSamp(ab));
        rays.push(Ray(self.eye, uvPatchSample));
      }
    }

    return rays;
  }

  return self;

})(Object.create(null))}
