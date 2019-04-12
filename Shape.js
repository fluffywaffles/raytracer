var Shape = function (name, material, translation, rotation, scaling) { return (function (self) {

  // Shape base material
  self.material = material || Material();

  // Material selection pattern
  self.pattern  = null;

  self.name     = name;

  self.translation = translation || mat4.create();
  self.rotation    = rotation    || mat4.create();
  self.scaling     = scaling     || mat4.create();

  self.getMaterial = function (coord) {
    return (self.pattern && self.pattern(coord)) || self.material;
  }

  self.translate = function (x, y, z) {
    mat4.translate(self.translation, self.translation, vec3.fromValues(x, y, z));
  }

  self.rotate = function (rad, axis) {
    mat4.rotate(self.rotation, self.rotation, rad, axis);
  }

  self.scale = function (x, y, z) {
    if (x && !y && !z)
      mat4.scale(self.scaling, self.scaling, vec3.fromValues(x, x, x));
    else
      mat4.scale(self.scaling, self.scaling, vec3.fromValues(x, y, z));
  }

  self.transformIncidentRay = function (inRay) {
    var io = vec3.create(), ie = vec3.create(), id = vec3.create();
    vec3.copy(io, inRay.origin), vec3.copy(id, inRay.direction);

    var tr = Ray();

    var pt = mat4.create();
    // [S-1][R-1] * direction
    mat4.multiply(pt, self.rotation, self.scaling);
    vec3.transformMat4(tr.direction, id, mat4.invert(mat4.create(), pt));

    // [T-1][S-1][R-1] * origin
    mat4.multiply(pt, pt, self.translation);
    vec3.transformMat4(tr.origin, io, mat4.invert(mat4.create(), pt));

    // normalize direction
    vec3.normalize(tr.direction, tr.direction);

    return tr;
  }

  self.untransformCoordinate = function (c) {
    var coord = vec3.create();
    vec3.copy(coord, c);

    // [T][R][S] c-1
    vec3.transformMat4(coord, coord, self.translation);
    vec3.transformMat4(coord, coord, self.rotation);
    vec3.transformMat4(coord, coord, self.scaling);

    return coord;
  }

  self.transformNormal = function (normal) {
    var n = vec3.create();
    vec3.copy(n, normal);

    vec3.transformMat4(n, n, self.rotation);
    vec3.transformMat4(n, n, mat4.invert(mat4.create(), self.scaling));

    return n;
  }

  return self;

})(Object.create(null))}
