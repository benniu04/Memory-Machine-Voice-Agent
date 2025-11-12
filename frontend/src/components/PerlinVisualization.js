import React, { useRef, useEffect } from 'react';
import Sketch from 'react-p5';

const PerlinVisualization = ({ sentiment = 0, sentimentLabel = 'neutral', emotionIntensity = 0.5, energyLevel = 0.5 }) => {
  const flowFieldRef = useRef(null);
  const flowParticlesRef = useRef([]);
  const orbitParticlesRef = useRef([]);
  const energyRingsRef = useRef([]);
  const targetColorRef = useRef({ h: 200, s: 70, b: 85 });
  const currentColorRef = useRef({ h: 200, s: 70, b: 85 });
  const color2Ref = useRef({ h: 280, s: 70, b: 85 });
  const color3Ref = useRef({ h: 320, s: 70, b: 85 });
  const phaseRef = useRef(0);
  const prevSentimentRef = useRef(0);

  const getSentimentColor = (sentiment, label, intensity) => {
    let hue, hue2, hue3, saturation, brightness;

    switch (label.toLowerCase()) {
      case 'joyful':
      case 'happy':
      case 'excited':
        hue = 45; hue2 = 25; hue3 = 60;
        saturation = 85 + intensity * 15;
        brightness = 85 + intensity * 15;
        break;
      case 'calm':
      case 'peaceful':
      case 'serene':
        hue = 190; hue2 = 210; hue3 = 170;
        saturation = 70 + intensity * 20;
        brightness = 75 + intensity * 20;
        break;
      case 'anxious':
      case 'nervous':
      case 'tense':
        hue = 280; hue2 = 300; hue3 = 260;
        saturation = 75 + intensity * 25;
        brightness = 70 + intensity * 25;
        break;
      case 'angry':
      case 'frustrated':
        hue = 0; hue2 = 15; hue3 = 345;
        saturation = 90 + intensity * 10;
        brightness = 75 + intensity * 20;
        break;
      case 'sad':
      case 'melancholic':
      case 'depressed':
        hue = 220; hue2 = 240; hue3 = 200;
        saturation = 55 + intensity * 25;
        brightness = 50 + intensity * 30;
        break;
      case 'surprised':
      case 'amazed':
        hue = 160; hue2 = 180; hue3 = 280;
        saturation = 80 + intensity * 20;
        brightness = 80 + intensity * 20;
        break;
      case 'loving':
      case 'affectionate':
        hue = 330; hue2 = 310; hue3 = 350;
        saturation = 75 + intensity * 25;
        brightness = 80 + intensity * 20;
        break;
      default:
        hue = 200; hue2 = 280; hue3 = 320;
        saturation = 70 + intensity * 25;
        brightness = 75 + intensity * 25;
    }

    return { h: hue, h2: hue2, h3: hue3, s: saturation, b: brightness };
  };

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.colorMode(p5.HSB, 360, 100, 100, 100);

    // Minimal flow field
    const cols = Math.floor(p5.width / 25);
    const rows = Math.floor(p5.height / 25);
    flowFieldRef.current = Array(cols * rows).fill(0);

    // Reduced particle count for performance
    flowParticlesRef.current = [];
    for (let i = 0; i < 300; i++) {
      flowParticlesRef.current.push(new FlowParticle(p5));
    }

    orbitParticlesRef.current = [];
    for (let i = 0; i < 60; i++) {
      orbitParticlesRef.current.push(new OrbitParticle(p5, i));
    }

    energyRingsRef.current = [];
  };

  const draw = (p5) => {
    phaseRef.current += 0.01 + energyLevel * 0.02;

    // Sentiment change creates energy ring
    const sentimentChange = Math.abs(sentiment - prevSentimentRef.current);
    if (sentimentChange > 0.2) {
      createEnergyRing(p5);
      prevSentimentRef.current = sentiment;
    }

    // Color transitions
    const colors = getSentimentColor(sentiment, sentimentLabel, emotionIntensity);
    targetColorRef.current = colors;

    currentColorRef.current.h += (targetColorRef.current.h - currentColorRef.current.h) * 0.04;
    currentColorRef.current.s += (targetColorRef.current.s - currentColorRef.current.s) * 0.04;
    currentColorRef.current.b += (targetColorRef.current.b - currentColorRef.current.b) * 0.04;

    color2Ref.current.h += (targetColorRef.current.h2 - color2Ref.current.h) * 0.04;
    color2Ref.current.s = currentColorRef.current.s;
    color2Ref.current.b = currentColorRef.current.b;

    color3Ref.current.h += (targetColorRef.current.h3 - color3Ref.current.h) * 0.04;
    color3Ref.current.s = currentColorRef.current.s;
    color3Ref.current.b = currentColorRef.current.b;

    const pulse = Math.sin(phaseRef.current) * 0.5 + 0.5;

    // Clean background
    p5.background(0, 0, 1);

    // Single elegant ambient gradient
    p5.push();
    p5.blendMode(p5.ADD);
    const gradient = p5.drawingContext.createRadialGradient(
      p5.width / 2, p5.height / 2, 0,
      p5.width / 2, p5.height / 2, p5.width * 0.6
    );
    gradient.addColorStop(0, `hsla(${currentColorRef.current.h}, ${currentColorRef.current.s}%, ${currentColorRef.current.b * 0.2}%, ${0.15 * emotionIntensity})`);
    gradient.addColorStop(0.5, `hsla(${color2Ref.current.h}, ${color2Ref.current.s}%, ${color2Ref.current.b * 0.12}%, ${0.08 * emotionIntensity})`);
    gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
    p5.drawingContext.fillStyle = gradient;
    p5.rect(0, 0, p5.width, p5.height);
    p5.pop();

    // Simplified flow field
    const cols = Math.floor(p5.width / 25);
    const rows = Math.floor(p5.height / 25);
    const zoff = phaseRef.current * 0.2;
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols;
        const xoff = x * 0.1;
        const yoff = y * 0.1;
        
        let angle = p5.noise(xoff, yoff, zoff) * p5.TWO_PI * 3;
        angle += Math.sin(x * 0.15 + phaseRef.current) * energyLevel * 0.3;
        
        flowFieldRef.current[index] = angle;
      }
    }

    // Flow particles
    p5.push();
    p5.blendMode(p5.ADD);
    flowParticlesRef.current.forEach(particle => {
      particle.follow(p5, flowFieldRef.current, cols);
      particle.update(p5, energyLevel);
      particle.show(p5, currentColorRef.current, color2Ref.current, emotionIntensity, pulse);
      particle.edges(p5);
    });
    p5.pop();

    // Orbit particles
    p5.push();
    p5.blendMode(p5.ADD);
    orbitParticlesRef.current.forEach(particle => {
      particle.update(p5, phaseRef.current, energyLevel, emotionIntensity);
      particle.show(p5, color2Ref.current, color3Ref.current, emotionIntensity, pulse);
    });
    p5.pop();

    // Central energy core
    drawEnergyCore(p5, currentColorRef.current, color2Ref.current, color3Ref.current, emotionIntensity, energyLevel, pulse, phaseRef.current);

    // Energy rings
    p5.push();
    p5.blendMode(p5.ADD);
    energyRingsRef.current = energyRingsRef.current.filter(ring => {
      ring.update();
      ring.show(p5, currentColorRef.current, color2Ref.current);
      return ring.life > 0;
    });
    p5.pop();
  };

  const createEnergyRing = (p5) => {
    energyRingsRef.current.push(new EnergyRing(p5));
  };

  const drawEnergyCore = (p5, color1, color2, color3, intensity, energy, pulse, phase) => {
    p5.push();
    p5.blendMode(p5.ADD);
    p5.translate(p5.width / 2, p5.height / 2);

    // Elegant rotating rings
    const ringCount = 5;
    for (let i = 0; i < ringCount; i++) {
      p5.push();
      p5.rotate(phase * (0.3 + i * 0.15) + i * p5.PI / 3);
      
      const size = (100 + i * 50) * (1 + energy * 0.5) * (1 + pulse * 0.2);
      const alpha = (20 - i * 3) * intensity * (0.85 + pulse * 0.15);
      
      const colorToUse = i % 3 === 0 ? color1 : (i % 3 === 1 ? color2 : color3);
      
      p5.noFill();
      p5.stroke(colorToUse.h, colorToUse.s, colorToUse.b, alpha);
      p5.strokeWeight(2 + intensity * 2);
      p5.ellipse(0, 0, size, size * 0.35);
      p5.pop();
    }

    // Layered core glow
    const coreCount = 8;
    for (let i = coreCount; i > 0; i--) {
      const ratio = i / coreCount;
      const size = (30 + i * 15) * (1 + pulse * 0.35) * (1 + energy * 0.4);
      const alpha = (25 - i * 2.5) * intensity;
      
      const hue = i > 5 ? color1.h : (i > 2 ? color2.h : color3.h);
      
      p5.fill(hue, color1.s * (0.5 + ratio * 0.5), color1.b * (0.6 + ratio * 0.4), alpha);
      p5.noStroke();
      p5.circle(0, 0, size);
    }

    // Bright center point
    const centerSize = 20 * (1 + pulse * 0.6) * (1 + intensity * 0.6);
    p5.fill(color1.h, color1.s * 0.2, 100, 35 * intensity);
    p5.circle(0, 0, centerSize);

    // Radiating energy spikes
    const spikeCount = 12;
    for (let i = 0; i < spikeCount; i++) {
      const angle = (i / spikeCount) * p5.TWO_PI + phase;
      const length = (70 + Math.sin(phase * 2.5 + i) * 35) * (1 + energy * 0.7);
      const width = 2.5 + intensity * 3.5;
      
      p5.push();
      p5.rotate(angle);
      
      const gradient = p5.drawingContext.createLinearGradient(0, 0, length, 0);
      const colorToUse = i % 3 === 0 ? color1 : (i % 3 === 1 ? color2 : color3);
      gradient.addColorStop(0, `hsla(${colorToUse.h}, ${colorToUse.s}%, ${colorToUse.b}%, ${0.45 * intensity})`);
      gradient.addColorStop(1, `hsla(${colorToUse.h}, ${colorToUse.s}%, ${colorToUse.b}%, 0)`);
      
      p5.drawingContext.strokeStyle = gradient;
      p5.drawingContext.lineWidth = width;
      p5.drawingContext.beginPath();
      p5.drawingContext.moveTo(0, 0);
      p5.drawingContext.lineTo(length, 0);
      p5.drawingContext.stroke();
      
      p5.pop();
    }

    p5.pop();
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    
    const cols = Math.floor(p5.width / 25);
    const rows = Math.floor(p5.height / 25);
    flowFieldRef.current = Array(cols * rows).fill(0);

    flowParticlesRef.current = [];
    for (let i = 0; i < 300; i++) {
      flowParticlesRef.current.push(new FlowParticle(p5));
    }

    orbitParticlesRef.current = [];
    for (let i = 0; i < 60; i++) {
      orbitParticlesRef.current.push(new OrbitParticle(p5, i));
    }
  };

  useEffect(() => {
    targetColorRef.current = getSentimentColor(sentiment, sentimentLabel, emotionIntensity);
  }, [sentiment, sentimentLabel, emotionIntensity]);

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};

// Flow Particle - Beautiful flowing trails
class FlowParticle {
  constructor(p5) {
    this.pos = p5.createVector(p5.random(p5.width), p5.random(p5.height));
    this.vel = p5.createVector(0, 0);
    this.acc = p5.createVector(0, 0);
    this.maxSpeed = 4;
    this.prevPos = this.pos.copy();
    this.depth = p5.random(0.4, 1);
  }

  follow(p5, flowField, cols) {
    const x = Math.floor(this.pos.x / 25);
    const y = Math.floor(this.pos.y / 25);
    const index = x + y * cols;
    const angle = flowField[index];
    if (angle !== undefined) {
      const force = p5.createVector(Math.cos(angle), Math.sin(angle));
      force.mult(this.depth);
      this.applyForce(force);
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update(p5, energy) {
    this.vel.add(this.acc);
    this.maxSpeed = (2.5 + energy * 4) * this.depth;
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  show(p5, color1, color2, intensity, pulse) {
    const dist = p5.dist(this.pos.x, this.pos.y, p5.width / 2, p5.height / 2);
    const maxDist = p5.dist(0, 0, p5.width, p5.height) / 2;
    const distFactor = 1 - (dist / maxDist) * 0.5;
    
    const alpha = (20 + intensity * 55) * distFactor * this.depth * (0.85 + pulse * 0.15);
    const weight = (1.2 + intensity * 2.8) * this.depth;
    
    const colorToUse = this.depth > 0.7 ? color1 : color2;
    
    p5.stroke(colorToUse.h, colorToUse.s, colorToUse.b, alpha);
    p5.strokeWeight(weight);
    p5.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    
    this.updatePrev();
  }

  updatePrev() {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }

  edges(p5) {
    if (this.pos.x > p5.width) { this.pos.x = 0; this.updatePrev(); }
    if (this.pos.x < 0) { this.pos.x = p5.width; this.updatePrev(); }
    if (this.pos.y > p5.height) { this.pos.y = 0; this.updatePrev(); }
    if (this.pos.y < 0) { this.pos.y = p5.height; this.updatePrev(); }
  }
}

// Orbit Particle - Elegant orbital motion
class OrbitParticle {
  constructor(p5, index) {
    this.angle = (index / 60) * p5.TWO_PI;
    this.radius = 120 + (index % 4) * 70;
    this.baseRadius = this.radius;
    this.speed = 0.003 + (index % 8) * 0.0008;
    this.size = p5.random(3, 7);
    this.depth = p5.random(0.5, 1);
    this.phase = p5.random(p5.TWO_PI);
  }

  update(p5, phase, energy, intensity) {
    this.angle += this.speed * (0.6 + energy * 1.4);
    this.radius = this.baseRadius * (1 + Math.sin(phase * 2 + this.phase) * 0.25 * energy);
    this.phase += 0.025;
  }

  show(p5, color1, color2, intensity, pulse) {
    const x = p5.width / 2 + Math.cos(this.angle) * this.radius;
    const y = p5.height / 2 + Math.sin(this.angle) * this.radius;
    
    const alpha = (30 + intensity * 50) * this.depth * pulse;
    const size = this.size * (1 + pulse * 0.35) * this.depth;
    
    const colorToUse = this.depth > 0.7 ? color1 : color2;
    
    // Main particle
    p5.fill(colorToUse.h, colorToUse.s, colorToUse.b, alpha);
    p5.noStroke();
    p5.circle(x, y, size);
    
    // Soft glow
    p5.fill(colorToUse.h, colorToUse.s * 0.5, colorToUse.b, alpha * 0.3);
    p5.circle(x, y, size * 2.5);
  }
}

// Energy Ring - Expanding shock wave on sentiment change
class EnergyRing {
  constructor(p5) {
    this.radius = 0;
    this.maxRadius = p5.dist(0, 0, p5.width, p5.height);
    this.life = 1;
    this.speed = 6;
  }

  update() {
    this.radius += this.speed;
    this.speed *= 1.08;
    this.life = 1 - (this.radius / this.maxRadius);
  }

  show(p5, color1, color2) {
    const alpha = this.life * 40;
    const weight = 3.5 * this.life;
    
    p5.push();
    p5.translate(p5.width / 2, p5.height / 2);
    
    p5.noFill();
    p5.stroke(color1.h, color1.s, color1.b, alpha);
    p5.strokeWeight(weight);
    p5.circle(0, 0, this.radius * 2);
    
    p5.stroke(color2.h, color2.s, color2.b, alpha * 0.5);
    p5.strokeWeight(weight * 0.5);
    p5.circle(0, 0, this.radius * 2 * 1.15);
    
    p5.pop();
  }
}

export default PerlinVisualization;
