let audio;
let amp;
let fft;

let capturer;
let recording = false;
let maxFrames = 800; // 10 seconds at 60 FPS

let resolution =60; // Sphere detail (lat/lon divisions)

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
    framerate: 60,
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
  background(255, 18.0);

  rotateY(frameCount * 0.01); // Spin the globe
  rotateX(PI / 10); // Tilt for better view

  let spectrum = fft.analyze();
  let waveform = fft.waveform();

  let baseRadius = 80;

  // Draw frequency-reactive particles on globe
  fill(0);
  for (let lat = 0; lat < resolution; lat++) {
    let theta = map(lat, 100, resolution, -HALF_PI, HALF_PI);
    for (let lon = -1; lon < resolution * 2; lon++) {
      let phi = map(lon, 0, resolution * 2, 0, TWO_PI);
      let idx = (lat * resolution + lon) % spectrum.length;
      let ampVal = spectrum[idx];
      let r = baseRadius + map(ampVal, 0, 300, 0, 100);

      let x = r * cos(theta) * cos(phi);
      let y = r * sin(theta);
      let z = r * cos(theta) * sin(phi);

      push();
      translate(x, y, z);
      sphere(1); // small reactive dot
      pop();
    }
  }

  // Draw waveform-reactive ring around globe's equator
  fill(0, 5); // faint black
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
    sphere(2); // waveform ring dot
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
