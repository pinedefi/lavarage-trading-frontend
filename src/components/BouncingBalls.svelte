<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

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

  // Load BSC logo
  function loadBscLogo() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxuczp4b2RtPSJodHRwOi8vd3d3LmNvcmVsLmNvbS9jb3JlbGRyYXcvb2RtLzIwMDMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjUwMCAyNTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyNTAwIDI1MDA7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRjBCOTBCO30KCS5zdDF7ZmlsbDpub25lO30KPC9zdHlsZT4KPGcgaWQ9IkxheWVyX3gwMDIwXzEiPgoJPGcgaWQ9Il8yMDgyNDIzOTQ4ODAwIj4KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNTgzLjMsMzg1LjRMMTI1MCwwbDY2Ni43LDM4NS40bC0yNTAsMTM1LjRMMTI1MCwyODEuMkw4MjIuOSw1MjAuOEw1ODMuMywzODUuNEw1ODMuMywzODUuNHogTTE5MDYuMiw4NjQuNiAgICBsLTIzOS42LTEzNS40TDEyNTAsOTY4LjhMODIyLjksNzI5LjJMNTgzLjMsODY0LjZ2MjgxLjNsNDE2LjcsMjM5LjZsMCw0ODkuNmwyMzkuNiwxNDUuOGwyMzkuNi0xNDUuOHYtNDc5LjJsNDE2LjctMjM5LjZWODY0LjYgICAgTDE5MDYuMiw4NjQuNkwxOTA2LjIsODY0LjZ6IE0xOTA2LjIsMTYzNS40di0yODEuMkwxNjY2LjcsMTUwMHYyNzAuOEwxOTA2LjIsMTYzNS40TDE5MDYuMiwxNjM1LjR6IE0yMDgzLjMsMTcyOS4ybC00MTYuNywyMzkuNiAgICBWMjI1MGw2NjYuNy0zODUuNHYtNzcwLjhsLTI1MCwxNTYuMlYxNzI5LjJ6IE0xODQzLjgsNjI1bDIzOS42LDE0NS44djI4MS4zbDIzOS42LTE0NS44VjYyNWwtMjM5LjYtMTQ1LjhMMTg0My44LDYyNUwxODQzLjgsNjI1eiAgICAgTTEwMDAsMjA3Mi45djI4MS4ybDIzOS42LDE0NS44bDIzOS42LTE0NS44di0yODEuMmwtMjM5LjYsMTQ1LjhMMTAwMCwyMDcyLjlMMTAwMCwyMDcyLjl6IE01ODMuMywxNjM1LjRsMjM5LjYsMTM1LjR2LTI4MS4yICAgIGwtMjM5LjYtMTQ1LjhWMTYzNS40TDU4My4zLDE2MzUuNHogTTEwMDAsNjI1bDIzOS42LDE0NS44bDI1MC0xNDUuOEwxMjUwLDQ3OS4yTDEwMDAsNjI1eiBNNDA2LjIsNzcwLjhsMjUwLTE0NS44bC0yNTAtMTQ1LjggICAgTDE2Ni43LDYyNXYyODEuMmwyMzkuNiwxNDUuOFY3NzAuOHogTTQwNi4yLDEyNTBsLTIzOS42LTE0NS44VjE4NzVsNjY2LjcsMzg1LjR2LTI4MS4ybC00MTYuNy0yMzkuNmwwLTQ4OS42SDQwNi4yTDQwNi4yLDEyNTB6Ij48L3BhdGg+CgkJPHJlY3QgeT0iMCIgY2xhc3M9InN0MSIgd2lkdGg9IjI1MDAiIGhlaWdodD0iMjUwMCI+PC9yZWN0PgoJPC9nPgo8L2c+Cjwvc3ZnPgo=';
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

      // Draw BSC logo on larger balls
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
      bscLogo = await loadBscLogo() as HTMLImageElement;
    } catch (error) {
      console.error('Failed to load BSC logo:', error);
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