import React, { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    // Official UEFA Champions League Starball & Stadium Lighting Palette
    const colors = [
      'rgba(0, 242, 255, 0.65)',   // Electric Cyan
      'rgba(255, 215, 0, 0.65)',   // Trophy Pure Gold
      'rgba(255, 255, 255, 0.6)',  // Pure Star White
      'rgba(0, 132, 255, 0.55)',   // Starball Royal Blue
      'rgba(255, 42, 95, 0.4)',    // Energy Accent
    ];

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 4 + 1.5;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.speedY = Math.random() * -0.8 - 0.2; // Slow upward float like stadium sparks
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.baseAlpha = Math.random() * 0.5 + 0.2;
        this.twinkleSpeed = Math.random() * 0.03 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.twinklePhase += this.twinkleSpeed;

        // Wrap around screens
        if (this.y < 0) {
          this.y = height;
          this.x = Math.random() * width;
        }
        if (this.x < 0 || this.x > width) {
          this.x = Math.random() * width;
          this.y = height;
        }
      }

      draw() {
        const alpha = Math.max(0.1, this.baseAlpha + Math.sin(this.twinklePhase) * 0.25);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        ctx.fillStyle = this.color.replace(/[\d\.]+\)$/, `${alpha})`);
        ctx.shadowBlur = this.size * 3;
        ctx.shadowColor = this.color.includes('0, 242') ? '#00f2ff' : '#ffd700';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    const init = () => {
      const particleCount = Math.min(75, Math.floor(width / 22));
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    init();
    animate();

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ mixBlendMode: 'screen', opacity: 0.85 }}
    />
  );
};

export default ParticlesBackground;
