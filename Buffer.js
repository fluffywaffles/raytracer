var Buffer = function (xsize, ysize) { return (function (self) {

  self.xsize = xsize;
  self.ysize = ysize;

  self.image = new Uint8Array(xsize * ysize * 3);

  for (var idx = 0; idx < xsize * ysize * 3; idx +=3) {
    self.image[idx    ] = 250;
    self.image[idx + 1] = 160;
    self.image[idx + 2] = 30;
  }

  return self;

})(Object.create(null))}
