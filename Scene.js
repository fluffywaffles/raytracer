var Scene = function (resolution) { return (function (self) {

  self.lights   = [];
  self.geometry = [];
  self.antialiasing = false;
  self.reflectionDepth = 0;

  self.enableAntialiasing = function (level) {
    if (level == 1) self.antialiasing = false;
    else self.antialiasing = true;
    self.camera.antialiasingMode = level;
  }

  var powersOfTwo = [ 256, 512, 1024, 2048, 4196 ];

  self.addGeometry = function (shape) {
    self.geometry.push(shape);
  }

  self.addLight = function (light) {
    light.scene = self;
    self.lights.push(light);
  }

  self.closestPowerOfTwo = function (match) {
    var best = 0;

    for (var i = 0; i < powersOfTwo.length; i++) {
      if (match - powersOfTwo[i] <= 0) {
        best = powersOfTwo[i];
        break;
      }
    }

    return best;
  }

  // Blue-ish
  self.backgroundColor = [50, 50, 255];

  var eye   = vec3.fromValues(0, 4, 10),
      focus = vec3.fromValues(0, 2, 0),
      up    = vec3.fromValues(0, 1, 0);

  self.setResolution = function(resolution) {
    if (resolution.length) resolution = Math.max.apply(Math, resolution);
    var powOfTwo    = self.closestPowerOfTwo(resolution);
    self.resolution = powOfTwo;
    if (self.camera)
      self.camera = Camera(self.camera.eye, self.camera.focus, self.camera.up,
                           powOfTwo, powOfTwo);
    else
      self.camera     = Camera(eye, focus, up, powOfTwo, powOfTwo);
    self.buffer     = Buffer(powOfTwo, powOfTwo);
  }

  self.setResolution(resolution || 256);

  self.tracePixel = function (i, j) {
    // NOTE(jordan): This is where it should all come together
    var color = vec3.create();
    var colorFactor = 1 / Math.pow(self.camera.antialiasingMode, 2);

    var rays = self.camera.eyeRays(i, j);

    rays.forEach(function (ray) {
      ray.cast(self.geometry);
      var hit = ray.nearestHit;

      if (!hit) {
        vec3.add(color, color, self.backgroundColor);
      } else {
        var baseColor = hit.getColor(self.lights);
        var baseShape = hit.shape;
        vec3.add(color, color, baseColor);

        var reflectionFactor = 1;
        var reflectionRay = ray;
        for (var ri = 0; ri < self.reflectionDepth; ri++) {
          if (hit == null) continue;
          if (hit.shape.reflectionEnabled) {
            baseShape = hit.shape;
            reflectionRay = reflectionRay.reflect(hit);
            reflectionRay.cast(self.geometry, baseShape);
            hit = reflectionRay.nearestHit;
            if (hit != null) {
              hit.reflected = true;
              vec3.add(color, color, hit.getColor(self.lights));
              reflectionFactor++;
            }
          }
        }
        // antialiasing really darkens our image, so let's mitigate a little
        if (self.antialiasing && reflectionFactor > 1)
          reflectionFactor *= (1 - self.camera.antialiasingMode * 0.11);
        vec3.scale(color, color, 1 / reflectionFactor);
      }
    });

    if (self.antialiasing)
      vec3.scale(color, color, colorFactor);

    return color;
  }

  self.render = function () {
    var xsize = self.buffer.xsize,
        ysize = self.buffer.ysize,
        x, y, i;

    x = y = i = 0;

    for (y = 0; y < ysize; y++) {
      for (x = 0; x < xsize; x++) {
        var color = self.tracePixel(x, y);
        i = (y * xsize + x) * 3; // R, G, B

        self.buffer.image[  i  ] = color[0];
        self.buffer.image[i + 1] = color[1];
        self.buffer.image[i + 2] = color[2];
      }
    }
  }

  return self;

})(Object.create(null))};
