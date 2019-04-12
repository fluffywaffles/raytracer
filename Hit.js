var Hit = function (shape, t, coord, normal) { return (function (self) {

  // ray parameter (origin + dir.scale(t))
  self.t      = t;

  self.coord  = vec3.create();
  self.normal = vec3.create();
  vec3.copy(self.coord, coord);
  vec3.copy(self.normal, normal);

  self.shape  = shape;

  var color = vec3.create(),
      lightVec = vec3.create(),
      H = vec3.create(),
      view = vec3.create(),
      ambient = vec3.create(),
      nh = 0,
      specCoeff = 0,
      inShadow = false,
      distSquare = 0,
      ambientIntensity = 1.0,
      difIntensity    = 1.0,
      specIntensity    = 1.0;

  self.getColor = function (lights) {
    var ambientFactor = 1.0;
    var mat = self.shape.getMaterial(self.coord);

    vec3.copy(color, mat.ambient);
    vec3.scale(color, color, 0.5);

    lights.forEach(function(l) {
      if (l.on) {
        vec3.subtract(lightVec, l.position, self.coord);

        var lightRay = Ray(self.coord, l.position);

        distSquare    = vec3.squaredLength(lightVec);
        ambientFactor *= l.intensity[0] / distSquare;

        inShadow = lightRay.isShadowCast(l.scene.geometry, self, distSquare);

        if (! inShadow) {
          vec3.normalize(lightVec, lightVec);

          difIntensity   = l.intensity[1] / distSquare;
          specIntensity  = l.intensity[2] / distSquare;

          // diffuse
          vec3.scaleAndAdd(color, color, mat.diffuse, difIntensity);

          // specular
          // blinn approximation for V dot R (view dot reflect)
          vec3.subtract(view, l.scene.camera.eye, self.coord);
          vec3.normalize(view, view);
          // H = (view + light) / 2
          vec3.add(H, view, lightVec);
          vec3.scale(H, H, 0.5);
          // N dot H = cos(theta / 2)
          nh = vec3.dot(H, self.normal);
          specCoeff = Math.pow(nh, mat.shiny);

          if (nh > 0) {
            vec3.scaleAndAdd(color, color, mat.specular, specCoeff * specIntensity);
          }
        }
      }
    });

    // amb + amb * lightingAddtlFactor
    vec3.scaleAndAdd(color, color, mat.ambient, ambientFactor);
    vec3.add(color, color, ambient);

    if ( color[0] > 255 ) color[0] = 255;
    if ( color[1] > 255 ) color[1] = 255;
    if ( color[2] > 255 ) color[2] = 255;

    return color;

  }

  self.distance = function (from) {
    return vec3.distance(self.coord, from);
  }

  return self;

})(Object.create(null))};
