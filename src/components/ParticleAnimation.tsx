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
  baseY: number;
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

  // Get the current theme's primary color from CSS custom properties
  const getPrimaryColor = (): [number, number, number] => {
    // Check what theme is currently active
    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.contains('dark');
    
    // Define theme colors directly (converted from OKLCH to RGB)
    const themeColors: Record<string, { light: [number, number, number]; dark: [number, number, number] }> = {
      slate: {
        light: [102, 66, 166] as [number, number, number], // oklch(0.402 0.053 263) converted to RGB
        dark: [139, 108, 193] as [number, number, number]   // Lighter version for dark mode
      },
      green: {
        light: [34, 139, 34] as [number, number, number],   // Forest green
        dark: [50, 205, 50] as [number, number, number]     // Lighter green for dark mode
      },
      // Add more themes here as needed:
      // blue: {
      //   light: [59, 130, 246] as [number, number, number],  // Blue
      //   dark: [96, 165, 250] as [number, number, number]    // Light blue
      // },
      // purple: {
      //   light: [147, 51, 234] as [number, number, number],  // Purple
      //   dark: [168, 85, 247] as [number, number, number]    // Light purple
      // }
    };
    
    // Find which theme is currently active
    const activeTheme = Object.keys(themeColors).find(theme => 
      htmlElement.classList.contains(theme)
    ) || 'slate'; // Default to slate if no theme class found
    
    const color = isDark 
      ? themeColors[activeTheme].dark 
      : themeColors[activeTheme].light;
    
    return color;
  };

  // Create a new particle that bounces horizontally
  const createParticle = (canvas: HTMLCanvasElement): Particle => {
    // Position particles near the bottom 1/3 of the container
    const underlineY = canvas.height * 0.7 + (Math.random() - 0.5) * 4; // Bottom third with variance
    
    return {
      x: Math.random() * 20, // Start from left side with some variance
      y: underlineY,
      size: 1 + Math.random(), // 1-2px size
      speedX: 0.5 + Math.random() * 0.8, // Speed between 0.5-1.3px per frame
      baseY: underlineY,
      opacity: 0.7 + Math.random() * 0.3,
      life: 0,
      maxLife: 180 + Math.random() * 120 // 3-5 seconds lifespan
    };
  };

  // Update particle positions and lifecycle
  const updateParticles = (canvas: HTMLCanvasElement) => {
    const particles = particlesRef.current;
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      // Move particle horizontally
      particle.x += particle.speedX;
      
      // Bounce off edges
      if (particle.x <= 0 || particle.x >= canvas.width) {
        particle.speedX = -particle.speedX; // Reverse direction
        // Add slight Y variance on bounce
        particle.y = particle.baseY + (Math.random() - 0.5) * 2;
      }
      
      // Keep particle in bounds
      particle.x = Math.max(0, Math.min(canvas.width, particle.x));
      
      particle.life++;
      
      // Fade out over lifespan
      const fadeProgress = particle.life / particle.maxLife;
      particle.opacity = (1 - fadeProgress) * 0.8;
      
      // Remove dead particles
      if (particle.life >= particle.maxLife) {
        particles.splice(i, 1);
      }
    }
  };

  // Render particles on canvas
  const renderParticles = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const [r, g, b] = getPrimaryColor();
    const particles = particlesRef.current;
    
    particles.forEach(particle => {
      ctx.save();
      
      // Create a subtle glow effect
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity})`;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${particle.opacity * 0.8})`;
      ctx.shadowBlur = 2;
      
      // Draw the particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    if (isActive) {
      const currentTime = Date.now();
      
      // Spawn new particles periodically
      if (currentTime - lastSpawnTime.current > 200) { // Faster spawning for more particles
        if (particlesRef.current.length < 16) { // Double the particle count (was 8)
          particlesRef.current.push(createParticle(canvas));
        }
        lastSpawnTime.current = currentTime;
      }
      
      updateParticles(canvas);
      renderParticles(canvas, ctx);
    } else {
      // Clear canvas when inactive
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Resize canvas to match container dimensions
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
      style={{
        zIndex: 10
      }}
    />
  );
};