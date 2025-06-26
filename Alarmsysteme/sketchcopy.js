window.addEventListener('DOMContentLoaded', () => {
  // Wait for the sketch.js canvas to exist in the DOM
  const trySetupPlane = () => {
    const canvas = document.querySelector('canvas');

    if (!canvas) {
      requestAnimationFrame(trySetupPlane);
      return;
    }

    // Give the canvas an ID so it can be used as a texture
    canvas.setAttribute('id', 'textureCanvas');

    // Move the canvas into the <a-assets> element if not already there
    const assets = document.querySelector('#assets-container');
    if (assets && !assets.contains(canvas)) {
      assets.appendChild(canvas);
    }

    // Create an <a-plane> to display the canvas as a texture
    const plane = document.createElement('a-plane');
    plane.setAttribute('id', 'planeObject');
    plane.setAttribute('position', '0 2 -5');
    plane.setAttribute('rotation', '0 0 0');
    plane.setAttribute('width', '4');
    plane.setAttribute('height', '4');
    plane.setAttribute('material', 'src: #textureCanvas; transparent: true; opacity: 0.85;');

    // Append the plane to the scene
    document.querySelector('a-scene').appendChild(plane);

    // Register a component that forces the texture to refresh each frame
    AFRAME.registerComponent('update-texture', {
      tick: function () {
        const mat = this.el.getObject3D('mesh')?.material;
        if (mat?.map) mat.map.needsUpdate = true;
      }
    });

    // Attach the component to the plane
    plane.setAttribute('update-texture', '');
  };

  // Start checking for the canvas
  trySetupPlane();
});
