<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { browser } from '$app/environment';
import { appConfig } from '$lib/config/appConfig';

  interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    rotation: number; // Add rotation for the logo
  }

  let canvas: HTMLCanvasElement;
  let balls: Ball[] = [];
  let mouse = { x: 0, y: 0 };
  let animationFrame: number;
  let bscLogo: HTMLImageElement;

  // Vibrant colors without transparency
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEEAD',
    '#FF9F9F',
    '#88D8C0',
    '#7EB6FF'
  ];

  // Load logo from config
  
function loadLogo() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = appConfig.branding.logo;
    });
  }

  function updateCanvasSize() {
    if (!browser) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initBalls() {
    if (!browser || !canvas) return;
    balls = [];
    const numBalls = 80;
    
    for (let i = 0; i < numBalls; i++) {
      balls.push({
        x: Math.random() * canvas.width,
        y: canvas.height - Math.random() * 200,
        vx: 0, // Start with no initial velocity
        vy: 0,
        radius: Math.random() * 20 + 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2 // Random initial rotation
      });
    }
  }

  function resolveCollision(ball1: Ball, ball2: Ball) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < ball1.radius + ball2.radius) {
      // Move balls apart
      const overlap = (ball1.radius + ball2.radius - distance) / 2;
      const moveX = (dx / distance) * overlap;
      const moveY = (dy / distance) * overlap;
      
      ball1.x -= moveX;
      ball1.y -= moveY;
      ball2.x += moveX;
      ball2.y += moveY;
      
      // Calculate collision response
      const normalX = dx / distance;
      const normalY = dy / distance;
      
      const p = 2 * (ball1.vx * normalX + ball1.vy * normalY - ball2.vx * normalX - ball2.vy * normalY) 
                / 2;
      
      // Update velocities
      ball1.vx -= p * normalX;
      ball1.vy -= p * normalY;
      ball2.vx += p * normalX;
      ball2.vy += p * normalY;
      
      // Add more energy loss in collisions
      ball1.vx *= 0.8; // Increased energy loss
      ball1.vy *= 0.8;
      ball2.vx *= 0.8;
      ball2.vy *= 0.8;
    }
  }

  function lightenColor(color: string, amount: number): string {
    // Remove the # if present
    color = color.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    
    // Lighten each component
    const lighter = [r, g, b].map(c => {
      const nc = Math.floor(c + (255 - c) * amount);
      return Math.min(255, nc);
    });
    
    // Convert back to hex
    return '#' + lighter.map(c => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  function animate() {
    if (!browser || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Handle ball-to-ball collisions
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        resolveCollision(balls[i], balls[j]);
      }
    }

    balls.forEach(ball => {
      // Apply mouse force
      const dx = mouse.x - ball.x;
      const dy = mouse.y - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxForce = 150;

      if (distance < maxForce) {
        const force = (maxForce - distance) / maxForce;
        ball.vx -= (dx / distance) * force * 2.0;
        ball.vy -= (dy / distance) * force * 2.0;
        ball.rotation += force * 0.1;
      }

      // Update position
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Apply gravity
      ball.vy += 0.3;

      // Bounce off walls
      if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx *= -0.5;
      }
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -0.5;
      }
      if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -0.5;
        ball.vx *= 0.8;
      }
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -0.5;
      }

      // Apply air resistance
      ball.vx *= 0.98;
      ball.vy *= 0.98;

      // Stop tiny movements
      if (Math.abs(ball.vx) < 0.01) ball.vx = 0;
      if (Math.abs(ball.vy) < 0.01) ball.vy = 0;

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.fill();
      ctx.closePath();

      // Draw logo on larger balls
      if (ball.radius > 25 && bscLogo) {
        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.rotate(ball.rotation);
        
        // Create lighter version of ball color for etching
        const etchColor = lightenColor(ball.color, 0.3);
        
        // Draw etched effect
        ctx.globalCompositeOperation = 'soft-light';
        const logoSize = ball.radius * 1.4;
        
        // Draw main etching
        ctx.fillStyle = etchColor;
        ctx.drawImage(
          bscLogo,
          -logoSize / 2,
          -logoSize / 2,
          logoSize,
          logoSize
        );
        
        // Add subtle highlight
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.3;
        ctx.drawImage(
          bscLogo,
          -logoSize / 2,
          -logoSize / 2,
          logoSize,
          logoSize
        );
        
        ctx.restore();
      }
    });

    animationFrame = requestAnimationFrame(animate);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!browser || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouse = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function handleResize() {
    if (!browser) return;
    updateCanvasSize();
    initBalls();
  }

  onMount(async () => {
    if (!browser) return;
    
    try {
      bscLogo = await loadLogo() as HTMLImageElement;
    } catch (error) {
      console.error('Failed to load logo:', error);
    }
    
    updateCanvasSize();
    initBalls();
    animate();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
  });

  onDestroy(() => {
    if (!browser) return;
    
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('resize', handleResize);
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

<canvas
  bind:this={canvas}
  style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;"
/> 