let audio;
let fft;

let resolution = 80;
let baseRadius = 180;
let particleOffsets = [];

function preload() {
  audio = loadSound('Warnung1.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL, { alpha: true });
  angleMode(RADIANS);
  noStroke();

  fft = new p5.FFT();
  fft.setInput(audio);

  userStartAudio().then(() => audio.loop());

  // Generate random phase offsets for more organic motion
  for (let lat = 1; lat < resolution; lat++) {
    for (let lon = 1; lon < resolution * 2; lon++) {
      particleOffsets.push(random(TWO_PI));
    }
  }
}

function draw() {
  fill(0, 20);
  rect(-width/2, -height/2, width, height);

  rotateY(frameCount * 0.009);
  rotateX(PI / 10);

  let spectrum = fft.analyze();
  let t = frameCount * 0.01;

  let index = 0;
  for (let lat = 1; lat < resolution; lat++) {
    let theta = map(lat, 0, resolution, -HALF_PI, HALF_PI);
    for (let lon = 1; lon < resolution * 2; lon++) {
      let phi = map(lon, 0, resolution * 2, 0, TWO_PI);
      let idx = index % spectrum.length;
      let ampVal = spectrum[idx];

      // Wave oscillation using sine
      let wave = sin(t + particleOffsets[index]) * 2;

      let r = baseRadius + map(ampVal, 0, 255, 0, 300) + wave;
      let x = r * cos(theta) * cos(phi);
      let y = r * sin(theta);
      let z = r * cos(theta) * sin(phi);

      let alpha = map(ampVal, 10, 255, 100, 255);
      fill(255);

      push();
      translate(x, y, z);
      sphere(0.9);
      pop();

      index++;
    }
  }
}
