var Light = function (position, intensity) { return (function (self) {

  self.on = true;
  self.position = position;
  self.intensity = intensity || vec3.fromValues(1.0, 20.0, 20.0);

  return self;

})(Object.create(null))}
