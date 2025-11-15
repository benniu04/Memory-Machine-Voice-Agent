import React, { useRef, useEffect } from 'react';
import Sketch from 'react-p5';
import { useVisualizationStore } from '../stores';

const PerlinVisualization = () => {
  const { sentiment, emotionIntensity, energyLevel, sentimentLabel } = useVisualizationStore();
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
  
  // NEW: Store current motion parameters
  const motionParamsRef = useRef({
    flowMultiplier: 1.0,
    particleSpeed: 1.0,
    turbulence: 0.3,
    orbitalSpeed: 1.0,
    coreIntensity: 1.0,
    directionalBias: 0
  });

  const getSentimentColor = (sentiment, label, intensity) => {
    let hue, hue2, hue3, saturation, brightness;
    const normalizedLabel = label.toLowerCase().trim();

    if (normalizedLabel.includes('joy') || normalizedLabel.includes('happy') || normalizedLabel.includes('excit')) {
      hue = 45; hue2 = 25; hue3 = 60;
      saturation = 85 + intensity * 15;
      brightness = 85 + intensity * 15;
    } else if (normalizedLabel.includes('calm') || normalizedLabel.includes('peace') || normalizedLabel.includes('seren') || normalizedLabel.includes('relax')) {
      hue = 190; hue2 = 210; hue3 = 170;
      saturation = 70 + intensity * 20;
      brightness = 75 + intensity * 20;
    } else if (normalizedLabel.includes('anxi') || normalizedLabel.includes('nerv') || normalizedLabel.includes('tens') || normalizedLabel.includes('worr')) {
      hue = 280; hue2 = 300; hue3 = 260;
      saturation = 75 + intensity * 25;
      brightness = 70 + intensity * 25;
    } else if (normalizedLabel.includes('ang') || normalizedLabel.includes('frust') || normalizedLabel.includes('rage')) {
      hue = 0; hue2 = 10; hue3 = 350;
      saturation = 95 + intensity * 5;
      brightness = 80 + intensity * 15;
    } else if (normalizedLabel.includes('sad') || normalizedLabel.includes('melanch') || normalizedLabel.includes('depress') || normalizedLabel.includes('gloo')) {
      hue = 230; hue2 = 250; hue3 = 210;
      saturation = 60 + intensity * 20;
      brightness = 55 + intensity * 25;
    } else if (normalizedLabel.includes('surpris') || normalizedLabel.includes('amaz') || normalizedLabel.includes('shock')) {
      hue = 160; hue2 = 180; hue3 = 280;
      saturation = 80 + intensity * 20;
      brightness = 80 + intensity * 20;
    } else if (normalizedLabel.includes('lov') || normalizedLabel.includes('affect') || normalizedLabel.includes('tender')) {
      hue = 330; hue2 = 310; hue3 = 350;
      saturation = 75 + intensity * 25;
      brightness = 80 + intensity * 20;
    } else if (normalizedLabel.includes('fear') || normalizedLabel.includes('scare') || normalizedLabel.includes('dread')) {
      hue = 280; hue2 = 260; hue3 = 300;
      saturation = 70 + intensity * 20;
      brightness = 50 + intensity * 20;
    } else {
      // FALLBACK: Use sentiment value
      if (sentiment >= 0.4) {
        hue = 45; hue2 = 25; hue3 = 60;
        saturation = 70 + intensity * 20;
        brightness = 80 + intensity * 15;
      } else if (sentiment >= 0.1) {
        hue = 190; hue2 = 210; hue3 = 170;
        saturation = 65 + intensity * 20;
        brightness = 75 + intensity * 20;
      } else if (sentiment >= -0.1) {
        hue = 200; hue2 = 220; hue3 = 260;
        saturation = 60 + intensity * 25;
        brightness = 70 + intensity * 25;
      } else if (sentiment >= -0.4) {
        hue = 230; hue2 = 250; hue3 = 210;
        saturation = 60 + intensity * 20;
        brightness = 55 + intensity * 25;
      } else {
        hue = 0; hue2 = 10; hue3 = 350;
        saturation = 90 + intensity * 10;
        brightness = 75 + intensity * 20;
      }
    }

    return { h: hue, h2: hue2, h3: hue3, s: saturation, b: brightness };
  };

  // NEW: Get motion parameters based on sentiment
  const getMotionParameters = (sentiment, label, intensity, energy) => {
    const normalizedLabel = label.toLowerCase().trim();
    
    let flowMultiplier = 1.0;
    let particleSpeed = 1.0;
    let turbulence = 0.3;
    let orbitalSpeed = 1.0;
    let coreIntensity = 1.0;
    let directionalBias = 0; // 0 = none, positive = upward, negative = downward
    
    if (normalizedLabel.includes('sad') || normalizedLabel.includes('melanch') || normalizedLabel.includes('depress') || normalizedLabel.includes('gloo')) {
      // MELANCHOLIC: Slow, heavy, downward drift
      flowMultiplier = 0.4;
      particleSpeed = 0.5;
      turbulence = 0.1;
      orbitalSpeed = 0.3;
      coreIntensity = 0.6;
      directionalBias = -0.4; // Downward pull
    } else if (normalizedLabel.includes('anxi') || normalizedLabel.includes('nerv') || normalizedLabel.includes('tens') || normalizedLabel.includes('worr')) {
      // ANXIOUS: Jittery, rapid, chaotic
      flowMultiplier = 1.4;
      particleSpeed = 1.8;
      turbulence = 0.8;
      orbitalSpeed = 2.5;
      coreIntensity = 1.2;
      directionalBias = 0; // No bias, just chaos
    } else if (normalizedLabel.includes('ang') || normalizedLabel.includes('frust') || normalizedLabel.includes('rage')) {
      // ANGRY: Aggressive, sharp, erratic
      flowMultiplier = 1.6;
      particleSpeed = 2.0;
      turbulence = 1.2;
      orbitalSpeed = 1.8;
      coreIntensity = 1.5;
      directionalBias = 0; // Chaotic, not directional
    } else if (normalizedLabel.includes('calm') || normalizedLabel.includes('peace') || normalizedLabel.includes('seren') || normalizedLabel.includes('relax')) {
      // CALM: Smooth, circular, gentle
      flowMultiplier = 0.6;
      particleSpeed = 0.7;
      turbulence = 0.15;
      orbitalSpeed = 0.5;
      coreIntensity = 0.8;
      directionalBias = 0;
    } else if (normalizedLabel.includes('joy') || normalizedLabel.includes('happy') || normalizedLabel.includes('excit')) {
      // JOYFUL: Upward, bouncy, expanding
      flowMultiplier = 1.3;
      particleSpeed = 1.5;
      turbulence = 0.5;
      orbitalSpeed = 1.6;
      coreIntensity = 1.4;
      directionalBias = 0.4; // Upward lift
    } else if (normalizedLabel.includes('fear') || normalizedLabel.includes('scare') || normalizedLabel.includes('dread')) {
      // FEARFUL: Contracted, retreating
      flowMultiplier = 0.8;
      particleSpeed = 1.2;
      turbulence = 0.6;
      orbitalSpeed = 1.4;
      coreIntensity = 0.7;
      directionalBias = 0; // Inward pull (handled separately in flow field)
    } else if (normalizedLabel.includes('surpris') || normalizedLabel.includes('amaz') || normalizedLabel.includes('shock')) {
      // SURPRISED: Sudden, expansive
      flowMultiplier = 1.5;
      particleSpeed = 1.7;
      turbulence = 0.7;
      orbitalSpeed = 2.0;
      coreIntensity = 1.3;
      directionalBias = 0;
    } else if (normalizedLabel.includes('lov') || normalizedLabel.includes('affect') || normalizedLabel.includes('tender')) {
      // LOVING: Warm, flowing, gentle
      flowMultiplier = 0.9;
      particleSpeed = 1.0;
      turbulence = 0.25;
      orbitalSpeed = 0.8;
      coreIntensity = 1.1;
      directionalBias = 0;
    } else {
      // FALLBACK based on sentiment value
      if (sentiment >= 0.4) {
        // Positive - joyful parameters
        flowMultiplier = 1.3;
        particleSpeed = 1.5;
        turbulence = 0.5;
        orbitalSpeed = 1.6;
        coreIntensity = 1.4;
        directionalBias = 0.4;
      } else if (sentiment >= -0.4) {
        // Neutral - calm parameters
        flowMultiplier = 0.8;
        particleSpeed = 0.9;
        turbulence = 0.3;
        orbitalSpeed = 0.8;
        coreIntensity = 1.0;
        directionalBias = 0;
      } else {
        // Negative - sad parameters
        flowMultiplier = 0.4;
        particleSpeed = 0.5;
        turbulence = 0.1;
        orbitalSpeed = 0.3;
        coreIntensity = 0.6;
        directionalBias = -0.4;
      }
    }
    
    return { 
      flowMultiplier, 
      particleSpeed, 
      turbulence, 
      orbitalSpeed, 
      coreIntensity,
      directionalBias
    };
  };

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.colorMode(p5.HSB, 360, 100, 100, 100);

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

    energyRingsRef.current = [];
  };

  const draw = (p5) => {
    // NEW: Get motion parameters
    const motion = getMotionParameters(sentiment, sentimentLabel, emotionIntensity, energyLevel);
    motionParamsRef.current = motion;

    // Phase now affected by motion
    phaseRef.current += (0.01 + energyLevel * 0.02) * motion.flowMultiplier;

    // Sentiment change creates energy ring
    const sentimentChange = Math.abs(sentiment - prevSentimentRef.current);
    if (sentimentChange > 0.2) {
      createEnergyRing(p5);
      prevSentimentRef.current = sentiment;
    }

    // Color transitions
    const colors = getSentimentColor(sentiment, sentimentLabel, emotionIntensity);
    
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.01) {
      console.log('Visualization Debug:', {
        sentiment,
        sentimentLabel,
        emotionIntensity,
        targetHue: colors.h,
        motion: motion
      });
    }
    
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

    p5.background(0, 0, 1);

    // Ambient gradient (intensity now affected by coreIntensity)
    p5.push();
    p5.blendMode(p5.ADD);
    const gradient = p5.drawingContext.createRadialGradient(
      p5.width / 2, p5.height / 2, 0,
      p5.width / 2, p5.height / 2, p5.width * 0.6
    );
    gradient.addColorStop(0, `hsla(${currentColorRef.current.h}, ${currentColorRef.current.s}%, ${currentColorRef.current.b * 0.2}%, ${0.15 * emotionIntensity * motion.coreIntensity})`);
    gradient.addColorStop(0.5, `hsla(${color2Ref.current.h}, ${color2Ref.current.s}%, ${color2Ref.current.b * 0.12}%, ${0.08 * emotionIntensity * motion.coreIntensity})`);
    gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
    p5.drawingContext.fillStyle = gradient;
    p5.rect(0, 0, p5.width, p5.height);
    p5.pop();

    // NEW: Enhanced flow field with directional bias and turbulence
    const cols = Math.floor(p5.width / 25);
    const rows = Math.floor(p5.height / 25);
    const zoff = phaseRef.current * 0.2;
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols;
        const xoff = x * 0.1;
        const yoff = y * 0.1;
        
        // Base Perlin noise angle
        let angle = p5.noise(xoff, yoff, zoff) * p5.TWO_PI * 3;
        
        // Add wave motion based on energy
        angle += Math.sin(x * 0.15 + phaseRef.current) * energyLevel * 0.3;
        
        // NEW: Add turbulence (chaotic noise)
        if (motion.turbulence > 0.5) {
          const chaosNoise = p5.noise(xoff * 5, yoff * 5, zoff * 3) * p5.TWO_PI;
          angle += chaosNoise * motion.turbulence * 0.8;
        }
        
        // NEW: Add directional bias
        if (motion.directionalBias !== 0) {
          angle += p5.PI / 2 * motion.directionalBias; // Positive = up, negative = down
        }
        
        flowFieldRef.current[index] = angle;
      }
    }

    // Flow particles (now using motion parameters)
    p5.push();
    p5.blendMode(p5.ADD);
    flowParticlesRef.current.forEach(particle => {
      particle.follow(p5, flowFieldRef.current, cols);
      particle.update(p5, energyLevel, motion);
      particle.show(p5, currentColorRef.current, color2Ref.current, emotionIntensity, pulse, motion);
      particle.edges(p5);
    });
    p5.pop();

    // Orbit particles (now using motion parameters)
    p5.push();
    p5.blendMode(p5.ADD);
    orbitParticlesRef.current.forEach(particle => {
      particle.update(p5, phaseRef.current, energyLevel, emotionIntensity, motion);
      particle.show(p5, color2Ref.current, color3Ref.current, emotionIntensity, pulse);
    });
    p5.pop();

    // Central energy core (now using motion parameters)
    drawEnergyCore(p5, currentColorRef.current, color2Ref.current, color3Ref.current, emotionIntensity, energyLevel, pulse, phaseRef.current, motion);

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

  const drawEnergyCore = (p5, color1, color2, color3, intensity, energy, pulse, phase, motion) => {
    p5.push();
    p5.blendMode(p5.ADD);
    p5.translate(p5.width / 2, p5.height / 2);

    // NEW: Adjust core intensity
    const adjustedIntensity = intensity * motion.coreIntensity;

    // Elegant rotating rings (speed affected by motion)
    const ringCount = 5;
    for (let i = 0; i < ringCount; i++) {
      p5.push();
      p5.rotate(phase * (0.3 + i * 0.15) * motion.orbitalSpeed + i * p5.PI / 3);
      
      const size = (100 + i * 50) * (1 + energy * 0.5) * (1 + pulse * 0.2);
      const alpha = (20 - i * 3) * adjustedIntensity * (0.85 + pulse * 0.15);
      
      const colorToUse = i % 3 === 0 ? color1 : (i % 3 === 1 ? color2 : color3);
      
      p5.noFill();
      p5.stroke(colorToUse.h, colorToUse.s, colorToUse.b, alpha);
      p5.strokeWeight(2 + adjustedIntensity * 2);
      p5.ellipse(0, 0, size, size * 0.35);
      p5.pop();
    }

    // Layered core glow
    const coreCount = 8;
    for (let i = coreCount; i > 0; i--) {
      const ratio = i / coreCount;
      const size = (30 + i * 15) * (1 + pulse * 0.35) * (1 + energy * 0.4);
      const alpha = (25 - i * 2.5) * adjustedIntensity;
      
      const hue = i > 5 ? color1.h : (i > 2 ? color2.h : color3.h);
      
      p5.fill(hue, color1.s * (0.5 + ratio * 0.5), color1.b * (0.6 + ratio * 0.4), alpha);
      p5.noStroke();
      p5.circle(0, 0, size);
    }

    // Bright center point
    const centerSize = 20 * (1 + pulse * 0.6) * (1 + adjustedIntensity * 0.6);
    p5.fill(color1.h, color1.s * 0.2, 100, 35 * adjustedIntensity);
    p5.circle(0, 0, centerSize);

    // Radiating energy spikes (length affected by motion)
    const spikeCount = 12;
    for (let i = 0; i < spikeCount; i++) {
      const angle = (i / spikeCount) * p5.TWO_PI + phase * motion.flowMultiplier;
      const length = (70 + Math.sin(phase * 2.5 + i) * 35) * (1 + energy * 0.7) * motion.coreIntensity;
      const width = 2.5 + adjustedIntensity * 3.5;
      
      p5.push();
      p5.rotate(angle);
      
      const gradient = p5.drawingContext.createLinearGradient(0, 0, length, 0);
      const colorToUse = i % 3 === 0 ? color1 : (i % 3 === 1 ? color2 : color3);
      gradient.addColorStop(0, `hsla(${colorToUse.h}, ${colorToUse.s}%, ${colorToUse.b}%, ${0.45 * adjustedIntensity})`);
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
    motionParamsRef.current = getMotionParameters(sentiment, sentimentLabel, emotionIntensity, energyLevel);
  }, [sentiment, sentimentLabel, emotionIntensity, energyLevel]);

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};

// Flow Particle - NOW WITH MOTION PARAMETERS
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

  update(p5, energy, motion) {
    this.vel.add(this.acc);
    // NEW: Speed affected by motion.particleSpeed
    this.maxSpeed = (2.5 + energy * 4) * this.depth * motion.particleSpeed;
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  show(p5, color1, color2, intensity, pulse, motion) {
    // NEW: For very low energy states, occasionally skip particles for subtle effect
    if (motion.flowMultiplier < 0.6 && Math.random() > 0.85) {
      this.updatePrev();
      return;
    }

    const dist = p5.dist(this.pos.x, this.pos.y, p5.width / 2, p5.height / 2);
    const maxDist = p5.dist(0, 0, p5.width, p5.height) / 2;
    const distFactor = 1 - (dist / maxDist) * 0.5;
    
    // NEW: Alpha affected by coreIntensity
    const alpha = (20 + intensity * 55) * distFactor * this.depth * (0.85 + pulse * 0.15) * motion.coreIntensity;
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

// Orbit Particle - NOW WITH MOTION PARAMETERS
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

  update(p5, phase, energy, intensity, motion) {
    // NEW: Speed affected by motion.orbitalSpeed
    this.angle += this.speed * (0.6 + energy * 1.4) * motion.orbitalSpeed;
    this.radius = this.baseRadius * (1 + Math.sin(phase * 2 + this.phase) * 0.25 * energy);
    this.phase += 0.025;
  }

  show(p5, color1, color2, intensity, pulse) {
    const x = p5.width / 2 + Math.cos(this.angle) * this.radius;
    const y = p5.height / 2 + Math.sin(this.angle) * this.radius;
    
    const alpha = (30 + intensity * 50) * this.depth * pulse;
    const size = this.size * (1 + pulse * 0.35) * this.depth;
    
    const colorToUse = this.depth > 0.7 ? color1 : color2;
    
    p5.fill(colorToUse.h, colorToUse.s, colorToUse.b, alpha);
    p5.noStroke();
    p5.circle(x, y, size);
    
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