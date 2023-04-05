let particles = [];
const num = 1000;

const noiseScale = 0.01/2;

function setup() {
  createCanvas(2000, 2000).id('canvas');
  for(let i = 0; i < num; i ++) {
    particles.push(createVector(random(width), random(height)));
  }
  
  stroke(235, 236, 240);
  // For a cool effect try uncommenting this line
  // And comment out the background() line in draw
  // stroke(255, 50);
  clear();
}

function draw() {
  
  background(0, 10);
  for(let i = 0; i < num; i ++) {
    let p = particles[i];
    point(p.x, p.y); // Modify the point function to include the particle size
    let n = noise(p.x * noiseScale, p.y * noiseScale, frameCount * noiseScale * noiseScale);
    let a = TAU * n;
    p.x += cos(a);
    p.y += sin(a);
    if(!onScreen(p) && frameCount < 1000) {
      p.x = random(width);
      p.y = random(height);
    }
  }
  
}

function mouseReleased() {
  noiseSeed(millis());
  
  for(let i = 0; i < num; i ++) {
    let p = particles[i];
    let n = noise(p.x * noiseScale, p.y * noiseScale, frameCount * noiseScale * noiseScale);
    let a = TAU * n;
    p.x += cos(a);
    p.y += sin(a);
    
    // Add a random value to the angle
    let randomAngle = random(-.01, 0.1);
    a += randomAngle;
    p.x += cos(a);
    p.y += sin(a);

    
  }

  
}

function onScreen(v) {
  return v.x >= 0 && v.x <= width && v.y >= 0 && v.y <= height;
}