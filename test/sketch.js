let audio;
let fft;

let resolution = 80;
let baseRadius = 300;

let spectrumFrame;
let captured = false;

function preload() {
  audio = loadSound('Warnung1.mp3');
}

function setup() {
  pixelDensity(2); // sharper render
  createCanvas(2000, 2000, WEBGL);
  angleMode(RADIANS);
  noStroke();
  clear();

  fft = new p5.FFT();
  fft.setInput(audio);

  userStartAudio().then(() => {
    audio.play();
  });

  // Button to save
  const btn = createButton('Save Sphere as PNG');
  btn.position(20, 20);
  btn.mousePressed(() => saveCanvas('frozen_audio_sphere', 'png'));
}

function draw() {
  if (!captured) {
    let spectrum = fft.analyze();

    // Wait until audio data is meaningful (avoid empty/flat data)
    let energy = fft.getEnergy("bass");
    if (energy > 5) {
      spectrumFrame = spectrum;
      clear();
      renderSphere(spectrumFrame);
      captured = true;
      noLoop();
    }
  }
}

function renderSphere(spectrum) {
  rotateY(PI / 5);
  rotateX(PI / 10);

  let index = 0;
  for (let lat = 1; lat < resolution; lat++) {
    let theta = map(lat, 0, resolution, -HALF_PI, HALF_PI);
    for (let lon = 1; lon < resolution * 2; lon++) {
      let phi = map(lon, 0, resolution * 2, 0, TWO_PI);
      let idx = index % spectrum.length;
      let ampVal = spectrum[idx];

      let r = baseRadius + map(ampVal, 0, 255, 0, 300);
      let x = r * cos(theta) * cos(phi);
      let y = r * sin(theta);
      let z = r * cos(theta) * sin(phi);

      fill(255, map(ampVal, 50, 255, 80, 255));

      push();
      translate(x, y, z);
      sphere(2);
      pop();

      index++;
    }
  }
}
