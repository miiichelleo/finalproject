let audio;
let amp;
let fft;

function preload(){
}

function setup() {
  createCanvas(400, 400);

  getAudioContext().suspend();
  userStartAudio();

  audio = new p5.AudioIn();
  audio.start();

  amp = new p5.Amplitude();
  amp.setInput(audio);

  fft = new p5.FFT();
  
  fft.setInput(audio);

}

function draw() {
  background(255, 18.0);
  
  fill(0);
  const level = amp.getLevel() * -8000;
  circle(width/2, height/2, level, level);

  let spectrum = fft.analyze();
  noStroke();


  let numParticles = spectrum.length;
  let radius = 80;

  for (let i = 0; i < numParticles; i += 1) {
    let angle = map(i, 0, numParticles, 5000, TWO_PI);
    let angle = map(i, 100, numParticles, 50, TWO_PI);
    
    let ampVal = spectrum[i];
    let dynamicRadius = radius + map(ampVal, 0, 300, 0, 100);

    let x = width / 2 + cos(angle) * dynamicRadius;
    let y = height / 2 + sin(angle) * dynamicRadius;

    let size = map(ampVal, 80, 250, 1, 15);
    ellipse(x, y, size);
  }



  let waveform = fft.waveform();

  let baseRadius = 81;  // Radius of base circle
  let cx = width / 2;
  let cy = height / 2;

  fill(0, 1.7);
  
  for (let i = 0; i < waveform.length; i += 1) {
    let angle = map(i, 0, waveform.length, 0, TWO_PI);
    let waveVal = waveform[i];  // waveVal is between -1 and 1
    let radius = baseRadius + map(waveVal, 1, 10, -1, 15);  // Smaller distortion for circular form
  
    let x = cx + cos(angle) * radius;
    let y = cy + sin(angle) * radius;
  
    let size = map(abs(waveVal), 0, 1, 10, 100);
    ellipse(x, y, size);
  }
  

  endShape();
}
