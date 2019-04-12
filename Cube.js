var Cube = function (material, transform) { return (function (self) {
  //transform = transform || mat4.create();
  //mat4.translate(transform, transform, corner);
  // NOTE(jordan): inherit from Shape
  self = Shape('Cube', material, transform);

  self.surfaces = ['top', 'bottom', 'front', 'back', 'left', 'right']

  self.normals = {
    top:    [ 0,  1,  0],
    bottom: [ 0, -1,  0],
    front:  [ 0,  0,  1],
    back:   [ 0,  0, -1],
    left:   [ 1,  0,  0],
    right:  [-1,  0,  0]
  }

  self.corners = {
    top:    [0, 1, 0],
    bottom: [0, 0, 0],
    front:  [0, 0, 1],
    back:   [0, 0, 0],
    left:   [0, 0, 0],
    right:  [0, 0, 0]
  }

  self.findHit = function (inRay) {
    var rayToSurface = vec3.create(), coord = vec3.create(),
        normal, directionAlongNormal, normalDistance, t, surface, corner;
    var hit = null;
    var r = self.transformIncidentRay(inRay);

    for (var i = 0; i < self.surfaces.length; i++) {
      surface = self.surfaces[i];
      normal  = self.normals[surface];
      // get to the plane
      vec3.subtract(rayToSurface, self.corners[surface], r.origin);
      // cos(/_ direction, normal) -- AKA proj. direction onto norm
      directionAlongNormal = vec3.dot(r.direction, normal)
      // ||rayToSurf.|| * cos(/_ rayToSurf., normal) -- AKA proj. r2s onto norm
      normalDistance = vec3.dot(rayToSurface, normal)
      // get t!
      t = normalDistance / directionAlongNormal;
      if (t <= 0) continue;
      // untransformed direction
      vec3.scaleAndAdd(coord, r.origin, r.direction, t);
      // check bounds
      // x >=  0 and x <= 1
      // y >=  0 and y <= 1
      // z >= -1 and z <= 0
      if ((coord[0] >= 0 && coord[0] <= 1) &&
          (coord[1] >= 0 && coord[1] <= 1) &&
          (coord[2] >= 0 && coord[2] <= 1)) {
        if (hit == null || t < hit.t) {
          coord = self.untransformCoordinate(coord);
          hit = Hit(self, t, coord, normal);
        }
      }
    }

    return hit;
  }

  return self;

})(Object.create(null))}
