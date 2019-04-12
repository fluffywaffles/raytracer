var Material = function (name) { return (function (self) {

  self.name = name;

  // Dummy factor (all the mat.s set this to 0,0,0,1)
  self.emissive = vec3.create();
  // Phong Ambient light factor - base light
  self.ambient  = vec3.create();
  // Phong Diffuse light factor
  self.diffuse  = vec3.create();
  // Phong Specular highlight
  self.specular = vec3.create();
  // Phong shinyness value
  self.shiny    = Number();

  self.fromPhong = function (mat) {
    // NOTE(jordan): replace values with PhongMaterial values
    self.emissive = vec3.fromValues.apply(self, mat.emissive);
    vec3.scale(self.emissive, self.emissive, 255);
    self.ambient  = vec3.fromValues.apply(self, mat.ambient);
    vec3.scale(self.ambient, self.ambient, 255);
    self.diffuse  = vec3.fromValues.apply(self, mat.diffuse);
    vec3.scale(self.diffuse, self.diffuse, 255);
    self.specular = vec3.fromValues.apply(self, mat.specular);
    vec3.scale(self.specular, self.specular, 255);
    // But the number has to be set.
    self.shiny = mat.shiny;

    return self;
  }

  return self;

})(Object.create(null))}
