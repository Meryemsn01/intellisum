'use client';

import { useEffect, useRef } from 'react';

const AIBG = ({ letterPositions }) => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0, radius: 150 });
  const particles = useRef([]);
  let tracerParticles = [];
  let animationFrameId;

  useEffect(() => {
    mouse.current.x = window.innerWidth / 2;
    mouse.current.y = window.innerHeight / 2;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const particleCount = Math.floor(width * height / 20000);

    const handleMouseMove = (event) => {
      mouse.current.x = event.x;
      mouse.current.y = event.y;
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    class Particle {
      constructor(x, y, dirX, dirY, size, color) {
        this.x = x; this.y = y; this.dirX = dirX; this.dirY = dirY; this.size = size; this.color = color;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      update() {
        if (this.x > width || this.x < 0) this.dirX = -this.dirX;
        if (this.y > height || this.y < 0) this.dirY = -this.dirY;
        this.x += this.dirX;
        this.y += this.dirY;
        this.draw();
      }
    }

    const initParticles = () => {
      particles.current = [];
      for (let i = 0; i < particleCount; i++) {
        let size = Math.random() * 2 + 1;
        let x = Math.random() * width;
        let y = Math.random() * height;
        let dirX = (Math.random() * .4) - .2;
        let dirY = (Math.random() * .4) - .2;
        particles.current.push(new Particle(x, y, dirX, dirY, size, 'rgba(0, 190, 255, 0.5)'));
      }
    }
    
    const connect = () => {
      for (let a = 0; a < particles.current.length; a++) {
        for (let b = a; b < particles.current.length; b++) {
          let distance = Math.sqrt(Math.pow(particles.current[a].x - particles.current[b].x, 2) + Math.pow(particles.current[a].y - particles.current[b].y, 2));
          if (distance < width / 7) {
            let mouseDistance = Math.sqrt(Math.pow(mouse.current.x - particles.current[a].x, 2) + Math.pow(mouse.current.y - particles.current[a].y, 2));
            let opacity = 1 - (distance / (width / 7));
            
            ctx.beginPath();
            if (mouseDistance < mouse.current.radius) {
              ctx.strokeStyle = `rgba(0, 255, 255, ${opacity * (1 - mouseDistance / mouse.current.radius) * 2})`;
              ctx.lineWidth = 1.2;
            } else {
              ctx.strokeStyle = `rgba(0, 190, 255, ${opacity / 2})`;
              ctx.lineWidth = 0.5;
            }
            ctx.moveTo(particles.current[a].x, particles.current[a].y);
            ctx.lineTo(particles.current[b].x, particles.current[b].y);
            ctx.stroke();
          }
        }
      }
    }
    
    class Tracer {
        constructor(startX, startY, targetX, targetY) {
            this.x = startX; this.y = startY; this.targetX = targetX; this.targetY = targetY;
            this.speed = Math.random() * 0.05 + 0.03;
            this.life = 100;
        }
        update() {
            this.x += (this.targetX - this.x) * this.speed;
            this.y += (this.targetY - this.y) * this.speed;
            this.life -= 0.8;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(173, 216, 230, ${this.life / 100})`;
            ctx.fill();
        }
    }

    const initTracers = () => {
        if (!letterPositions || letterPositions.length === 0 || particles.current.length === 0) return;
        tracerParticles = [];
        letterPositions.forEach(pos => {
            for (let i = 0; i < 5; i++) {
                const startParticle = particles.current[Math.floor(Math.random() * particles.current.length)];
                tracerParticles.push(new Tracer(startParticle.x, startParticle.y, pos.x, pos.y));
            }
        });
    };

    if (letterPositions) {
      initTracers();
    }
    
    // ON REMET LA FONCTION POUR DESSINER L'ŒIL
    const drawCentralEye = (ctx, w, h, mouseX, mouseY) => {
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(w, h) * 0.1;
        const irisRadius = radius * 0.5;
        const pupilRadius = irisRadius * 0.5;

        const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
        const maxPupilMove = irisRadius - pupilRadius;
        const distanceToCenter = Math.min(maxPupilMove, Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)));
        const pupilX = centerX + Math.cos(angle) * distanceToCenter;
        const pupilY = centerY + Math.sin(angle) * distanceToCenter;

        ctx.beginPath();
        ctx.arc(centerX, centerY, irisRadius, 0, Math.PI * 2, false);
        const gradient = ctx.createRadialGradient(centerX, centerY, irisRadius * 0.5, centerX, centerY, irisRadius);
        gradient.addColorStop(0, 'rgba(0, 150, 200, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 50, 80, 0.6)');
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 190, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc( pupilX, pupilY, pupilRadius, 0, Math.PI * 2, false);
        ctx.fillStyle = 'rgba(200, 255, 255, 0.9)';
        ctx.fill();
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      // On utilise un fond semi-transparent pour un effet de traînée
      ctx.clearRect(0, 0, width, height); // Nettoie simplement le canvas sans repeindre
      
      for (let p of particles.current) {
        p.update();
      }
      connect();

      tracerParticles = tracerParticles.filter(p => p.life > 0);
      for (let p of tracerParticles) {
        p.update();
        p.draw();
      }

      // ON RAJOUTE L'APPEL À LA FONCTION DE L'ŒIL ICI
      drawCentralEye(ctx, width, height, mouse.current.x, mouse.current.y);
    }
    
    initParticles();
    animate();

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [letterPositions]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>;
};

export default AIBG;