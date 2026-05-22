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
    // Colors of stadium lights: gold, magenta, white with opacity
    const colors = [
      'rgba(212, 175, 55, 0.7)',  // Gold (đậm hơn)
      'rgba(255, 42, 95, 0.6)',   // Neon Magenta (đậm hơn)
      'rgba(255, 255, 255, 0.4)', // Soft White (đậm hơn)
      'rgba(0, 184, 255, 0.5)',   // Cyan
      'rgba(0, 255, 127, 0.5)',   // Green
    ];

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 7 + 2; // lớn hơn
        this.speedX = Math.random() * 1.2 - 0.6; // nhanh hơn
        this.speedY = Math.random() * -1.2 - 0.2; // nhanh hơn, bay lên mạnh hơn
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.life = Math.random() * 100 + 50;
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

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
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = this.color.includes('255, 42') ? '#ff2a5f' : '#d4af37';
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow
      }
    }

    const init = () => {
      const particleCount = Math.min(120, Math.floor(width / 10)); // nhiều hơn
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
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default ParticlesBackground;
