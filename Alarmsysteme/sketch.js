let audio;
let amp;
let fft;

let capturer;
let recording = false;
let maxFrames = 100; // 10 seconds at 60 FPS

let resolution =80; // Sphere detail (lat/lon divisions)

function setup() {
  createCanvas(600, 600, WEBGL);
  angleMode(RADIANS);
  noStroke();

  // Setup audio
  getAudioContext().suspend(); // autoplay policy
  userStartAudio();

  audio = new p5.AudioIn();
  audio.start();

  amp = new p5.Amplitude();
  amp.setInput(audio);

  fft = new p5.FFT();
  fft.setInput(audio);

  // Setup CCapture for recording
  capturer = new CCapture({
    format: 'webm',
    framerate: 50,
    verbose: true,
  });

  frameRate(60);
}

function keyPressed() {
  if (key === 'r') {
    console.log('🎬 Starting recording...');
    recording = true;
    frameCount = 0;
    capturer.start();
  }
}

function draw() {
  background(255, 10);

  rotateY(frameCount * 0.01); // Spin the globe
  rotateX(PI / 10); // Tilt for better view

  let spectrum = fft.analyze();
  let waveform = fft.waveform();

  let baseRadius = 80;

  // Draw frequency-reactive particles on globe
  fill(0);
  for (let lat = 1; lat < resolution; lat++) {
    let theta = map(lat, 0, resolution, -HALF_PI, HALF_PI);
    for (let lon = 1; lon < resolution * 2; lon++) {
      let phi = map(lon, 0, resolution * 2, 0, TWO_PI);
      let idx = (lat * resolution + lon) % spectrum.length;
      let ampVal = spectrum[idx];

      let droop = map(ampVal, 0, 1000, 10, 80);

      let r = baseRadius + map(ampVal, 10, 340, 10, 200);
      let x = r * cos(theta) * cos(phi);
      let y = r * sin(theta) + droop;
      let z = r * cos(theta) * sin(phi);

      let alpha = map(droop, 0, 80, 255, 100);
      fill(0, alpha);

      push();
      translate(x, y, z);
      sphere(0.8); // small reactive dot
      pop();
    }
  }

  // Draw waveform-reactive ring around globe's equator
  fill(0, 20); // faint black
  let ringRadius = baseRadius + -10;
  for (let i = 0; i < waveform.length; i++) {
    let angle = map(i, 0, waveform.length, 0, TWO_PI);
    let waveVal = waveform[i];
    let r = ringRadius + map(waveVal, -1, 1, -10, 10);
    let x = r * cos(angle);
    let y = map(waveVal, -1, 1, -10, 10); // vertical jitter
    let z = r * sin(angle);

    push();
    translate(x, y, z);
    sphere(10); // waveform ring dot
    pop();
  }

  // Capture the frame if recording
  if (recording) {
    capturer.capture(document.querySelector('canvas'));
    if (frameCount >= maxFrames) {
      capturer.stop();
      capturer.save();
      recording = false;
      console.log('✅ Recording complete and saved.');
    }
  }
}
