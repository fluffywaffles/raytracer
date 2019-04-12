var scenes = {
  'scene1': scene1,
  'scene2': scene2,
  'scene3': scene3,
  'scene4': scene4
};

scene = scene1;

var antialiasingMode = document.getElementById('antialiasingMode'),
    reflectionDepth  = document.getElementById('reflectionDepth'),
    sceneSelect      = document.getElementById('scene'),
    resolutionSelect = document.getElementById('cameraResolution');

for (var s in scenes) {
  if (scenes[s] == scene)
    sceneSelect.value = s;
}
resolutionSelect.value = scene.resolution.toString();
antialiasingMode.value = scene.camera.antialiasingMode;
reflectionDepth.value = scene.reflectionDepth;

sceneSelect.onchange = function (e) {
  scene       = scenes[sceneSelect.value];
  imageBuffer = scene.buffer;
  antialiasingMode.value = scene.camera.antialiasingMode;
  reflectionDepth.value = scene.reflectionDepth;
  setupLights();
}

resolutionSelect.onchange = function (e) {
  scene.setResolution(parseInt(resolutionSelect.value));
  imageBuffer = scene.buffer;
  // hard reset
  main();
}

reflectionDepth.onchange = function (e) {
  scene.reflectionDepth = reflectionDepth.value;
}

antialiasingMode.onchange = function (e) {
  scene.antialiasingMode = antialiasingMode.value;
}

var setupLights = function () {
  var lctrls = document.getElementById('lights').children;

  for (var i = 0; i < lctrls.length; i++) {
    lctrls[i].disabled = true;
  }

  for (var l = 1; (l <= 2) && (l <= scene.lights.length); l ++){
    var light = scene.lights[l-1];
    var lightOnOff = document.getElementById('light' + l + 'on');
    var lightX = document.getElementById('light' + l + 'x');
    var lightY = document.getElementById('light' + l + 'y');
    var lightZ = document.getElementById('light' + l + 'z');

    lightOnOff.disabled = lightX.disabled = lightY.disabled = lightZ.disabled = false;

    lightX.value = light.position[0];
    lightY.value = light.position[1];
    lightZ.value = light.position[2];

    lightOnOff.onclick = function () {
      light.on = !light.on;
    }

    lightX.onchange = lightY.onchange = lightZ.onchange = function () {
      vec3.set(light, lightX.value, lightY.value, lightZ.value);
    }
  }
}

setupLights();
