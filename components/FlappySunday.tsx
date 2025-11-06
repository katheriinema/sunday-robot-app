"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import GlobalNavigation from '@/components/GlobalNavigation';

// Game constants (landscape like the Python version)
const SCREEN_WIDTH = 960;
const SCREEN_HEIGHT = 540;
const SPEED = 2;
const GRAVITY = 0.1; // Much slower fall - easier to control
const JUMP_FORCE = -4.5; // Softer jump for smoother control
const GAME_SPEED = 1.0; // Much slower initial game speed - pillars move slower
const MAX_FALL_SPEED = 5; // Lower cap for even smoother control
const GROUND_WIDTH = 2 * SCREEN_WIDTH;
const GROUND_HEIGHT = 50;
const PIPE_WIDTH = 80;
const PIPE_HEIGHT = 500;
const PIPE_GAP = 20; // Small vertical gap for challenge
const PIPE_SPACING = 250; // Much larger spacing - pillars spawn slower

interface Bird {
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
  rotation: number; // Add rotation for sprite tilting
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomHeight: number;
  width: number;
}

interface Ground {
  x: number;
  width: number;
}

export default function FlappySunday() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const gameLoopRef = useRef<number>();
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  // Game objects
  const birdRef = useRef<Bird>({
    x: 150, // Like the Python version
    y: SCREEN_HEIGHT / 2,
    speed: 0, // Start with no speed - gentler start
    width: 80, // Increased from 60
    height: 80, // Increased from 60
    rotation: 0 // Start with no rotation
  });
  
  const pipesRef = useRef<Pipe[]>([]);
  const groundsRef = useRef<Ground[]>([]);
  
  // Images
  const [images, setImages] = useState<{
    background: HTMLImageElement | null;
    bird: HTMLImageElement | null;
    pipe: HTMLImageElement | null;
    ground: HTMLImageElement | null;
  }>({
    background: null,
    bird: null,
    pipe: null,
    ground: null,
  });

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load images
  useEffect(() => {
    const loadImages = () => {
      const backgroundImg = new Image();
      backgroundImg.src = '/assets/flappy-background.png';
      
      const birdImg = new Image();
      birdImg.src = '/assets/flappy-sunday.png';
      
      const pipeImg = new Image();
      pipeImg.src = '/assets/pillar.png';
      
      const groundImg = new Image();
      groundImg.src = '/assets/flappy-background.png'; // Using background as ground for now

      Promise.all([
        new Promise<HTMLImageElement>((resolve) => {
          backgroundImg.onload = () => resolve(backgroundImg);
        }),
        new Promise<HTMLImageElement>((resolve) => {
          birdImg.onload = () => resolve(birdImg);
        }),
        new Promise<HTMLImageElement>((resolve) => {
          pipeImg.onload = () => resolve(pipeImg);
        }),
        new Promise<HTMLImageElement>((resolve) => {
          groundImg.onload = () => resolve(groundImg);
        }),
      ]).then(([background, bird, pipe, ground]) => {
        setImages({ background, bird, pipe, ground });
      });
    };

    loadImages();
  }, []);

  // Initialize game objects
  useEffect(() => {
    // Initialize grounds
    groundsRef.current = [];
    for (let i = 0; i < 2; i++) {
      groundsRef.current.push({
        x: GROUND_WIDTH * i,
        width: GROUND_WIDTH
      });
    }

    // Initialize pipes
    pipesRef.current = [];
    for (let i = 0; i < 5; i++) { // More pipes for landscape
      const size = Math.random() * 300 + 100; // Extreme heights (100-400px)
      pipesRef.current.push({
        x: SCREEN_WIDTH / 2 + i * PIPE_SPACING, // Consistent spacing
        topHeight: size,
        bottomHeight: SCREEN_HEIGHT - size - PIPE_GAP,
        width: PIPE_WIDTH
      });
    }
  }, []);

  // Bird jump function with smoother initial state
  const birdBump = () => {
    if (!gameStarted) {
      setGameStarted(true);
      // Start with a gentler initial speed
      birdRef.current.speed = JUMP_FORCE * 0.8;
      birdRef.current.rotation = -20;
    } else {
      birdRef.current.speed = JUMP_FORCE; // Softer jump force
      birdRef.current.rotation = -20; // Less extreme tilt for smoother feel
    }
  };

  // Check if sprite is off screen
  const isOffScreen = (sprite: { x: number; width: number }) => {
    return sprite.x < -sprite.width;
  };

  // Get random pipes
  const getRandomPipes = (xpos: number) => {
    // Create extreme height variations - some very tall tops with short bottoms, and vice versa
    const size = Math.random() * 300 + 100; // Extreme heights (100-400px)
    return {
      x: xpos,
      topHeight: size,
      bottomHeight: SCREEN_HEIGHT - size - PIPE_GAP,
      width: PIPE_WIDTH
    };
  };

  // Check collisions
  const checkCollisions = () => {
    const bird = birdRef.current;
    
    // Ground collision (with padding)
    if (bird.y + bird.height >= window.innerHeight - GROUND_HEIGHT - 10) {
      return true;
    }
    
    // Ceiling collision (with padding)
    if (bird.y <= 10) {
      return true;
    }
    
    // Pipe collisions (with padding)
    for (const pipe of pipesRef.current) {
      if (bird.x + 10 < pipe.x + pipe.width - 10 && 
          bird.x + bird.width - 10 > pipe.x + 10) {
        if (bird.y + 10 < pipe.topHeight - 10 || 
            bird.y + bird.height - 10 > window.innerHeight - GROUND_HEIGHT - pipe.bottomHeight + 10) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Game loop
  useEffect(() => {
    if (!images.background || !images.bird || !images.pipe || !images.ground) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw background
      ctx.drawImage(images.background!, 0, 0, window.innerWidth, window.innerHeight);

      if (!gameStarted) {
        // Draw start screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Flappy Sunday', window.innerWidth / 2, window.innerHeight / 2 - 50);
        
        ctx.font = '20px Arial';
        ctx.fillText('Press SPACE to start!', window.innerWidth / 2, window.innerHeight / 2 + 20);
        
        ctx.textAlign = 'left';
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      if (gameOver) {
        // Draw game over screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        
        ctx.fillStyle = 'red';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', window.innerWidth / 2, window.innerHeight / 2 - 50);
        
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, window.innerWidth / 2, window.innerHeight / 2);
        ctx.fillText('Press SPACE to restart', window.innerWidth / 2, window.innerHeight / 2 + 40);
        
        ctx.textAlign = 'left';
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Update bird with smoothing and capped fall speed
      birdRef.current.speed += GRAVITY;
      // Cap maximum falling speed for smoother, more controllable gameplay
      if (birdRef.current.speed > MAX_FALL_SPEED) {
        birdRef.current.speed = MAX_FALL_SPEED;
      }
      birdRef.current.y += birdRef.current.speed;

      // Update rotation based on speed with smoother transitions
      if (birdRef.current.speed > 0) {
        // Falling - tilt forward (clockwise) - slower rotation for smoother feel
        birdRef.current.rotation = Math.min(birdRef.current.rotation + 1.5, 35); // Reduced from 45 to 35 and slower rotation
      } else {
        // Rising - tilt up (counter-clockwise) - smoother upward tilt
        birdRef.current.rotation = Math.max(birdRef.current.rotation - 2, -20); // Reduced from -25 to -20
      }

      // Calculate progressive speed based on score - slower progression
      const currentSpeed = GAME_SPEED + (score * 0.05); // Speed increases by 0.05 per point (slower)
      const maxSpeed = GAME_SPEED * 2.5; // Lower cap for more manageable speed
      const finalSpeed = Math.min(currentSpeed, maxSpeed);

      // Update grounds
      groundsRef.current.forEach(ground => {
        ground.x -= finalSpeed;
      });

      // Update pipes
      pipesRef.current.forEach(pipe => {
        pipe.x -= finalSpeed;
      });

      // Remove off-screen grounds and add new ones
      if (isOffScreen(groundsRef.current[0])) {
        groundsRef.current.shift();
        groundsRef.current.push({
          x: GROUND_WIDTH - 20,
          width: GROUND_WIDTH
        });
      }

      // Remove off-screen pipes and add new ones
      if (isOffScreen(pipesRef.current[0])) {
        pipesRef.current.shift();
        setScore(prev => prev + 1);
      }
      
      // Add new pipes ahead of time to prevent empty spaces
      if (pipesRef.current.length > 0) {
        const lastPipe = pipesRef.current[pipesRef.current.length - 1];
        if (lastPipe.x < SCREEN_WIDTH + 400) { // Spawn new pipe when last one is 400px from screen edge (much further)
          const newPipe = getRandomPipes(lastPipe.x + PIPE_SPACING); // Consistent spacing
          pipesRef.current.push(newPipe);
        }
      }

      // Draw bird with rotation
      ctx.save();
      ctx.translate(birdRef.current.x + birdRef.current.width / 2, birdRef.current.y + birdRef.current.height / 2);
      ctx.rotate((birdRef.current.rotation * Math.PI) / 180);
      ctx.drawImage(images.bird!, -birdRef.current.width / 2, -birdRef.current.height / 2, birdRef.current.width, birdRef.current.height);
      ctx.restore();

      // Draw pipes
      pipesRef.current.forEach(pipe => {
        // Top pipe
        ctx.save();
        ctx.scale(1, -1);
        ctx.drawImage(images.pipe!, pipe.x, -pipe.topHeight, pipe.width, pipe.topHeight);
        ctx.restore();

        // Bottom pipe
        ctx.drawImage(images.pipe!, pipe.x, window.innerHeight - GROUND_HEIGHT - pipe.bottomHeight, pipe.width, pipe.bottomHeight);
      });

      // Draw grounds
      groundsRef.current.forEach(ground => {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(ground.x, window.innerHeight - GROUND_HEIGHT, ground.width, GROUND_HEIGHT);
      });

      // Draw score in top right corner with background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(window.innerWidth - 200, 10, 190, 60);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`Score: ${score}`, window.innerWidth - 20, 35);
      
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Speed: ${finalSpeed.toFixed(1)}x`, window.innerWidth - 20, 55);
      ctx.textAlign = 'left'; // Reset text alignment

      // Check collisions
      if (checkCollisions()) {
        setGameOver(true);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [images, gameStarted, gameOver, score]);

  // Handle input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameOver) {
          // Restart game
          setGameOver(false);
          setGameStarted(false);
          setScore(0);
          birdRef.current = {
            x: 150, // Like the Python version
            y: SCREEN_HEIGHT / 2,
            speed: SPEED,
            width: 80, // Increased from 60
            height: 80, // Increased from 60
            rotation: 0 // Reset rotation
          };
          // Reset pipes and grounds
          pipesRef.current = [];
          groundsRef.current = [];
          for (let i = 0; i < 2; i++) {
            groundsRef.current.push({
              x: GROUND_WIDTH * i,
              width: GROUND_WIDTH
            });
          }
          for (let i = 0; i < 5; i++) {
            const size = Math.random() * 300 + 100; // Extreme heights (100-400px)
            pipesRef.current.push({
              x: SCREEN_WIDTH / 2 + i * PIPE_SPACING, // Consistent spacing
              topHeight: size,
              bottomHeight: SCREEN_HEIGHT - size - PIPE_GAP,
              width: PIPE_WIDTH
            });
          }
        } else {
          birdBump();
        }
      }
    };

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (gameOver) {
        // Restart game
        setGameOver(false);
        setGameStarted(false);
        setScore(0);
        birdRef.current = {
          x: 150, // Like the Python version
          y: SCREEN_HEIGHT / 2,
          speed: SPEED,
          width: 80, // Increased from 60
          height: 80, // Increased from 60
          rotation: 0 // Reset rotation
        };
        // Reset pipes and grounds
        pipesRef.current = [];
        groundsRef.current = [];
        for (let i = 0; i < 2; i++) {
          groundsRef.current.push({
            x: GROUND_WIDTH * i,
            width: GROUND_WIDTH
          });
        }
        for (let i = 0; i < 5; i++) {
          const size = Math.random() * 300 + 100; // Extreme heights (100-400px)
          pipesRef.current.push({
            x: SCREEN_WIDTH / 2 + i * PIPE_SPACING, // Consistent spacing
            topHeight: size,
            bottomHeight: SCREEN_HEIGHT - size - PIPE_GAP,
            width: PIPE_WIDTH
          });
        }
      } else {
        birdBump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('touchstart', handleTouch);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchstart', handleTouch);
    };
  }, [gameOver]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      <GlobalNavigation />
      
      {/* Game Canvas - Full Screen */}
      <canvas
        ref={canvasRef}
        width={isClient ? window.innerWidth : 960}
        height={isClient ? window.innerHeight : 540}
        className="w-full h-full"
      />
    </div>
  );
}