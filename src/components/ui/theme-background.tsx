'use client';

import { useEffect, useRef, useMemo } from 'react';

interface ThemeBackgroundProps {
  themeId: string;
}

// ===== MATRIX RAIN =====
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    const fontSize = 14;
    let columns: number;
    let drops: number[];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(0).map(() => Math.random() * -100);
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 13, 5, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Bright head
        ctx.fillStyle = '#4ade80';
        ctx.fillText(char, x, y);
        // Dimmer trail
        ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - fontSize);

        if (y > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i] += 0.5 + Math.random() * 0.5;
      }
      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.5 }} />
  );
}

// ===== CIRCUIT BOARD WITH TRAVELING LIGHT =====
interface CircuitNode {
  x: number; y: number; r: number; glow: boolean;
}

interface CircuitPath {
  d: string;
  // waypoints for animation: array of {x, y} points along the path
  waypoints: { x: number; y: number }[];
  totalLength: number;
}

function CircuitBoard() {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const circuitData = useMemo(() => {
    const nodes: CircuitNode[] = [];
    const paths: CircuitPath[] = [];

    // Generate grid of nodes
    for (let x = 0; x < 1200; x += 80) {
      for (let y = 0; y < 2000; y += 80) {
        if (Math.random() > 0.55) {
          const offsetX = x + (Math.random() - 0.5) * 16;
          const offsetY = y + (Math.random() - 0.5) * 16;
          nodes.push({ x: offsetX, y: offsetY, r: Math.random() > 0.7 ? 4 : 2, glow: Math.random() > 0.8 });
        }
      }
    }

    // Connect nearby nodes with L-shaped paths
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && Math.random() > 0.5) {
          const midX = nodes[j].x;
          const midY = nodes[i].y;
          const d = `M ${nodes[i].x} ${nodes[i].y} L ${midX} ${midY} L ${nodes[j].x} ${nodes[j].y}`;
          const seg1 = Math.abs(midX - nodes[i].x) + Math.abs(midY - nodes[i].y);
          const seg2 = Math.abs(nodes[j].x - midX) + Math.abs(nodes[j].y - midY);
          paths.push({
            d,
            waypoints: [
              { x: nodes[i].x, y: nodes[i].y },
              { x: midX, y: midY },
              { x: nodes[j].x, y: nodes[j].y },
            ],
            totalLength: seg1 + seg2,
          });
        }
      }
    }

    return { nodes, paths };
  }, []);

  // Canvas-based traveling light animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const pulses: {
      pathIdx: number;
      progress: number; // 0 to 1
      speed: number;
      size: number;
      brightness: number;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Create initial pulses - spread them out
    const activePaths = circuitData.paths.filter(p => p.totalLength > 20);
    for (let i = 0; i < Math.min(activePaths.length, 40); i++) {
      if (Math.random() > 0.4) {
        pulses.push({
          pathIdx: i,
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.006,
          size: 2 + Math.random() * 3,
          brightness: 0.6 + Math.random() * 0.4,
        });
      }
    }

    // Add new pulses periodically
    let spawnTimer = 0;

    const getPointOnPath = (waypoints: { x: number; y: number }[], progress: number) => {
      // progress 0..1 maps along the polyline
      const totalLen = [];
      let cumLen = 0;
      for (let i = 1; i < waypoints.length; i++) {
        const segLen = Math.abs(waypoints[i].x - waypoints[i - 1].x) + Math.abs(waypoints[i].y - waypoints[i - 1].y);
        cumLen += segLen;
        totalLen.push(cumLen);
      }
      const targetDist = progress * cumLen;
      let accDist = 0;
      for (let i = 0; i < totalLen.length; i++) {
        const segStart = i === 0 ? 0 : totalLen[i - 1];
        const segEnd = totalLen[i];
        if (targetDist <= segEnd) {
          const segProgress = (targetDist - segStart) / (segEnd - segStart);
          return {
            x: waypoints[i].x + (waypoints[i + 1].x - waypoints[i].x) * segProgress,
            y: waypoints[i].y + (waypoints[i + 1].y - waypoints[i].y) * segProgress,
          };
        }
      }
      return waypoints[waypoints.length - 1];
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      spawnTimer++;
      if (spawnTimer > 60 && pulses.length < 60) {
        // Spawn a new pulse on a random path
        const idx = Math.floor(Math.random() * activePaths.length);
        pulses.push({
          pathIdx: idx,
          progress: 0,
          speed: 0.003 + Math.random() * 0.006,
          size: 2 + Math.random() * 3,
          brightness: 0.6 + Math.random() * 0.4,
        });
        spawnTimer = 0;
      }

      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;

        if (pulse.progress > 1) {
          // Reset pulse
          pulse.progress = 0;
          pulse.pathIdx = Math.floor(Math.random() * activePaths.length);
          pulse.speed = 0.003 + Math.random() * 0.006;
        }

        const path = activePaths[pulse.pathIdx];
        if (!path) continue;

        const pos = getPointOnPath(path.waypoints, pulse.progress);

        // Draw glow trail (several points behind the pulse)
        for (let t = 0; t < 8; t++) {
          const trailProgress = pulse.progress - t * 0.008;
          if (trailProgress < 0) break;
          const trailPos = getPointOnPath(path.waypoints, trailProgress);
          const alpha = pulse.brightness * (1 - t / 8) * 0.5;
          ctx.beginPath();
          ctx.arc(trailPos.x, trailPos.y, pulse.size * (1 - t * 0.08), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.fill();
        }

        // Draw main pulse dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pulse.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${pulse.brightness})`;
        ctx.fill();

        // Draw bright core
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pulse.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse.brightness * 0.7})`;
        ctx.fill();

        // Outer glow
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, pulse.size * 5);
        gradient.addColorStop(0, `rgba(6, 182, 212, ${pulse.brightness * 0.25})`);
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pulse.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [circuitData.paths]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <svg
        ref={svgRef}
        className="absolute inset-0"
        width="100%"
        height="100%"
        style={{ minWidth: '100vw', minHeight: '100vh' }}
      >
        <defs>
          <filter id="circuit-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Grid lines */}
        <pattern id="circuit-grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(6, 182, 212, 0.04)" strokeWidth="0.5" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#circuit-grid)" />

        {/* Circuit traces (static lines) */}
        {circuitData.paths.map((p, i) => (
          <path key={`p-${i}`} d={p.d} fill="none" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="1" />
        ))}

        {/* Nodes */}
        {circuitData.nodes.map((n, i) => (
          <g key={`n-${i}`}>
            <circle cx={n.x} cy={n.y} r={n.r}
              fill={n.glow ? 'rgba(6, 182, 212, 0.5)' : 'rgba(6, 182, 212, 0.15)'}
              filter={n.glow ? 'url(#circuit-glow)' : undefined}>
              {n.glow && (
                <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
              )}
            </circle>
            {n.r > 3 && (
              <circle cx={n.x} cy={n.y} r={8} fill="none" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="0.5" />
            )}
          </g>
        ))}
      </svg>

      {/* Canvas overlay for traveling light pulses */}
      <canvas ref={canvasRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// ===== NEON CITY =====
function NeonCity() {
  const lines = useMemo(() => {
    const result: { x1: number; y1: number; x2: number; y2: number; color: string; delay: number }[] = [];
    const colors = ['rgba(168, 85, 247, 0.3)', 'rgba(236, 72, 153, 0.3)', 'rgba(59, 130, 246, 0.25)', 'rgba(168, 85, 247, 0.2)'];

    // Horizontal neon lines
    for (let y = 50; y < 2000; y += 200 + Math.random() * 100) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const startX = Math.random() * 400;
      const endX = startX + 200 + Math.random() * 600;
      result.push({ x1: startX, y1: y, x2: endX, y2: y, color, delay: Math.random() * 5 });
    }

    // Vertical neon lines
    for (let x = 50; x < 1200; x += 250 + Math.random() * 150) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const startY = Math.random() * 300;
      const endY = startY + 150 + Math.random() * 400;
      result.push({ x1: x, y1: startY, x2: x, y2: endY, color, delay: Math.random() * 5 });
    }

    return result;
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <svg className="absolute inset-0" width="100%" height="100%" style={{ minWidth: '100vw', minHeight: '100vh' }}>
        <defs>
          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={l.color}
            strokeWidth="1.5"
            filter="url(#neon-glow)"
            strokeLinecap="round"
          >
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" begin={`${l.delay}s`} repeatCount="indefinite" />
          </line>
        ))}
        {/* Floating orbs */}
        {Array.from({ length: 6 }).map((_, i) => (
          <circle
            key={`orb-${i}`}
            cx={100 + Math.random() * 1000}
            cy={100 + Math.random() * 1800}
            r={20 + Math.random() * 40}
            fill={`rgba(${i % 2 === 0 ? '168, 85, 247' : '236, 72, 153'}, 0.03)`}
            filter="url(#neon-glow)"
          >
            <animate attributeName="r" values={`${20 + Math.random() * 20};${40 + Math.random() * 30};${20 + Math.random() * 20}`} dur={`${6 + Math.random() * 4}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  );
}

// ===== OCEAN WAVES =====
function OceanWaves() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <svg className="absolute bottom-0 left-0 w-full" height="300" viewBox="0 0 1440 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wave-grad-1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(14, 165, 233, 0.08)" />
            <stop offset="100%" stopColor="rgba(14, 165, 233, 0.02)" />
          </linearGradient>
          <linearGradient id="wave-grad-2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.06)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.01)" />
          </linearGradient>
        </defs>
        {/* Wave 1 */}
        <path fill="url(#wave-grad-1)">
          <animate attributeName="d"
            values="M0,200 C320,100 640,250 1080,150 C1260,100 1380,180 1440,160 L1440,300 L0,300 Z;
                    M0,180 C320,250 640,100 1080,200 C1260,250 1380,120 1440,180 L1440,300 L0,300 Z;
                    M0,200 C320,100 640,250 1080,150 C1260,100 1380,180 1440,160 L1440,300 L0,300 Z"
            dur="8s" repeatCount="indefinite" />
        </path>
        {/* Wave 2 */}
        <path fill="url(#wave-grad-2)">
          <animate attributeName="d"
            values="M0,230 C360,180 720,280 1080,210 C1260,180 1380,240 1440,220 L1440,300 L0,300 Z;
                    M0,250 C360,280 720,180 1080,240 C1260,280 1380,200 1440,240 L1440,300 L0,300 Z;
                    M0,230 C360,180 720,280 1080,210 C1260,180 1380,240 1440,220 L1440,300 L0,300 Z"
            dur="10s" repeatCount="indefinite" />
        </path>
        {/* Top wave */}
        <path fill="rgba(14, 165, 233, 0.03)">
          <animate attributeName="d"
            values="M0,80 C240,40 480,100 720,60 C960,20 1200,80 1440,50 L1440,300 L0,300 Z;
                    M0,60 C240,100 480,40 720,80 C960,120 1200,60 1440,80 L1440,300 L0,300 Z;
                    M0,80 C240,40 480,100 720,60 C960,20 1200,80 1440,50 L1440,300 L0,300 Z"
            dur="12s" repeatCount="indefinite" />
        </path>
      </svg>

      {/* Bubbles */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {Array.from({ length: 12 }).map((_, i) => (
          <circle
            key={i}
            cx={`${5 + Math.random() * 90}%`}
            cy={`${60 + Math.random() * 35}%`}
            r={2 + Math.random() * 4}
            fill="rgba(56, 189, 248, 0.1)"
          >
            <animate attributeName="cy" values={`${60 + Math.random() * 35}%;${20 + Math.random() * 20}%;${60 + Math.random() * 35}%`} dur={`${8 + Math.random() * 6}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur={`${8 + Math.random() * 6}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  );
}

// ===== SUNSET HORIZON =====
function SunsetHorizon() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900">
        <defs>
          <linearGradient id="sunset-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(28, 10, 0, 0)" />
            <stop offset="40%" stopColor="rgba(249, 115, 22, 0.06)" />
            <stop offset="60%" stopColor="rgba(234, 88, 12, 0.1)" />
            <stop offset="80%" stopColor="rgba(251, 191, 36, 0.05)" />
            <stop offset="100%" stopColor="rgba(28, 10, 0, 0)" />
          </linearGradient>
          <radialGradient id="sunset-sun" cx="50%" cy="55%" r="30%">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0.15)" />
            <stop offset="50%" stopColor="rgba(249, 115, 22, 0.05)" />
            <stop offset="100%" stopColor="rgba(28, 10, 0, 0)" />
          </radialGradient>
        </defs>
        {/* Sky gradient */}
        <rect width="1440" height="900" fill="url(#sunset-sky)" />
        {/* Sun glow */}
        <ellipse cx="720" cy="500" rx="300" ry="200" fill="url(#sunset-sun)">
          <animate attributeName="ry" values="200;220;200" dur="6s" repeatCount="indefinite" />
        </ellipse>
        {/* Sun line */}
        <line x1="200" y1="500" x2="1240" y2="500" stroke="rgba(251, 191, 36, 0.1)" strokeWidth="1" />
        {/* Clouds */}
        <ellipse cx="300" cy="300" rx="120" ry="25" fill="rgba(249, 115, 22, 0.04)">
          <animate attributeName="cx" values="300;350;300" dur="20s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="900" cy="250" rx="150" ry="20" fill="rgba(234, 88, 12, 0.03)">
          <animate attributeName="cx" values="900;850;900" dur="25s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="600" cy="380" rx="100" ry="18" fill="rgba(251, 191, 36, 0.04)">
          <animate attributeName="cx" values="600;650;600" dur="18s" repeatCount="indefinite" />
        </ellipse>
      </svg>
    </div>
  );
}

// ===== DARK STARS =====
function DarkStars() {
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: 0.5 + Math.random() * 1.5,
      delay: Math.random() * 5,
      dur: 3 + Math.random() * 4,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {stars.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="rgba(148, 163, 184, 0.4)">
            <animate attributeName="opacity" values="0.2;0.7;0.2" dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export function ThemeBackground({ themeId }: ThemeBackgroundProps) {
  if (themeId === 'default') return null;

  return (
    <>
      {themeId === 'dark' && <DarkStars />}
      {themeId === 'circuit' && <CircuitBoard />}
      {themeId === 'neon' && <NeonCity />}
      {themeId === 'matrix' && <MatrixRain />}
      {themeId === 'sunset' && <SunsetHorizon />}
      {themeId === 'ocean' && <OceanWaves />}
    </>
  );
}
