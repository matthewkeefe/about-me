import React, { useEffect, useRef } from 'react';

interface ParticleAnimationProps {
  /** Whether the animation should be active */
  isActive: boolean;
  /** Optional className for the container */
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export const ParticleAnimation: React.FC<ParticleAnimationProps> = ({ 
  isActive, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnTime = useRef<number>(0);

  // Get the current theme's muted-foreground color from CSS custom properties
  const getMutedForegroundColor = (): [number, number, number] => {
    // Create a temporary element to get the computed muted-foreground color
    const temp = document.createElement('div');
    temp.style.color = 'hsl(var(--muted-foreground))';
    temp.style.visibility = 'hidden';
    temp.style.position = 'absolute';
    document.body.appendChild(temp);
    
    const computedColor = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    
    // Parse RGB values from computed color
    const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return [
        parseInt(rgbMatch[1]),
        parseInt(rgbMatch[2]),
        parseInt(rgbMatch[3])
      ];
    }
    
    // Fallback to a muted gray
    return [107, 114, 128];
  };

  // HSL to RGB conversion
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  // Create a new particle
  const createParticle = (canvas: HTMLCanvasElement): Particle => {
    const maxLife = 120 + Math.random() * 120; // 2-4 seconds at 60fps (slower)
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 10, // Start below the canvas
      size: 2 + Math.random() * 3, // Slightly larger base size for gradient rendering
      speedX: (Math.random() - 0.5) * 1, // Slower horizontal drift
      speedY: -0.5 - Math.random() * 1, // Slower upward movement
      opacity: 0.7 + Math.random() * 0.3, // Higher base opacity
      life: 0,
      maxLife: maxLife
    };
  };

  // Update particle positions and lifecycle
  const updateParticles = (canvas: HTMLCanvasElement) => {
    const particles = particlesRef.current;
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.life++;
      
      // Fade out more gradually for better visibility
      const fadeProgress = particle.life / particle.maxLife;
      particle.opacity = (1 - Math.pow(fadeProgress, 2)) * 0.9; // Quadratic fade-out
      
      // Remove dead particles
      if (particle.life >= particle.maxLife || particle.y < -10) {
        particles.splice(i, 1);
      }
    }
  };

  // Render particles on canvas
  const renderParticles = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const [r, g, b] = getMutedForegroundColor();
    const particles = particlesRef.current;
    
    particles.forEach(particle => {
      ctx.save();
      
      // Create radial gradient for each particle that fades to transparency
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      
      // Center: full opacity primary color
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${particle.opacity})`);
      // Middle: medium opacity
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${particle.opacity * 0.6})`);
      // Edge: transparent
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      
      ctx.fillStyle = gradient;
      
      // Draw the particle circle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx || !isActive) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const currentTime = Date.now();
    
    // Spawn new particles periodically (slower rate)
    if (currentTime - lastSpawnTime.current > 200) { // Every 200ms (slower spawning)
      if (particlesRef.current.length < 12) { // Slightly fewer particles for cleaner look
        particlesRef.current.push(createParticle(canvas));
      }
      lastSpawnTime.current = currentTime;
    }
    
    updateParticles(canvas);
    renderParticles(canvas, ctx);
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Resize canvas to match container
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  };

  useEffect(() => {
    resizeCanvas();
    
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  // Clear particles when animation becomes inactive
  useEffect(() => {
    if (!isActive) {
      particlesRef.current = [];
    }
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
};