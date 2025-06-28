

let audio;
let amp;
let fft;

let capturer;
let recording = false;
let maxFrames = 600; // Record for 10 seconds at 60 FPS

function setup() {
  createCanvas(600, 600,);

  // Setup audio
  getAudioContext().suspend(); // required for autoplay policy
  userStartAudio(); // will resume context after a user interaction

  audio = new p5.AudioIn();
  audio.start();

  amp = new p5.Amplitude();
  amp.setInput(audio);

  fft = new p5.FFT();
  fft.setInput(audio);

  // Setup capturer
  capturer = new CCapture({
    format: 'webm',
    framerate: 60,
    verbose: true,
  });

  frameRate(60); // Ensure consistent timing
}

function keyPressed() {
  if (key === 'r') {
    console.log('🎬 Starting recording...');
    recording = true;
    frameCount = 0; // Reset to count frames correctly
    capturer.start();
  }
}

function draw() {
  background(255, 18.0);

  fill(0);
  const level = amp.getLevel() * -8000;
  ellipse(width / 2, height / 2, level, level);

  let spectrum = fft.analyze();
  noStroke();

  let numParticles = spectrum.length;
  let radius = 80;

  for (let i = 0; i < numParticles; i += 1) {
    let angle = map(i, 100, numParticles, 50, TWO_PI);
    let ampVal = spectrum[i];
    let dynamicRadius = radius + map(ampVal, 0, 300, 0, 100);

    let x = width / 2 + cos(angle) * dynamicRadius;
    let y = height / 2 + sin(angle) * dynamicRadius;
    let size = map(ampVal, 80, 250, 1, 15);

    ellipse(x, y, size);
  }

  let waveform = fft.waveform();
  let baseRadius = 83;
  let cx = width / 2;
  let cy = height / 2;

  fill(0, 1.0);


  for (let i = 0; i < waveform.length; i += 1) {
    let angle = map(i, 0, waveform.length, 0, TWO_PI);
    let waveVal = waveform[i];
    let radius = baseRadius + map(waveVal, 1, 10, -1, 15);
    let x = cx + cos(angle) * radius;
    let y = cy + sin(angle) * radius;
    let size = map(abs(waveVal), 1, 1, 11, 10);

    ellipse(x, y, size);
  }

  // Capture the frame if recording
  if (recording) {
    capturer.capture(document.querySelector('canvas'));
    if (frameCount >= maxFrames) {
      capturer.stop();
      capturer.save(); // Triggers download
      recording = false;
      console.log('✅ Recording complete and saved.');
    }
  }
}

