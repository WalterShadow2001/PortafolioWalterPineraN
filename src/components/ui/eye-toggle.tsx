'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface EyeToggleProps {
  show: boolean;
  onToggle: () => void;
  size?: number;
}

export function EyeToggle({ show, onToggle, size = 28 }: EyeToggleProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!eyeRef.current || show) return;

    const rect = eyeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxMove = size * 0.11;

    const ratio = Math.min(distance / 120, 1);
    const angle = Math.atan2(dy, dx);

    setPupilOffset({
      x: Math.cos(angle) * maxMove * ratio,
      y: Math.sin(angle) * maxMove * ratio,
    });
  }, [show, size]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const cx = size / 2 + pupilOffset.x;
  const cy = size * 0.38 + pupilOffset.y;

  return (
    <div
      ref={eyeRef}
      className="relative cursor-pointer select-none flex items-center justify-center"
      style={{ width: size, height: size * 0.65 }}
      onClick={onToggle}
      role="button"
      aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      title={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      <svg
        width={size}
        height={size * 0.75}
        viewBox={`0 0 ${size} ${size * 0.75}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {show ? (
          // Closed eye — curved line with subtle lashes
          <>
            <path
              d={`M 3 ${size * 0.37} Q ${size / 2} ${size * 0.37 - size * 0.14} ${size - 3} ${size * 0.37}`}
              stroke="#64748b"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
            <line x1={size * 0.35} y1={size * 0.28} x2={size * 0.33} y2={size * 0.22} stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            <line x1={size * 0.5} y1={size * 0.25} x2={size * 0.5} y2={size * 0.19} stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            <line x1={size * 0.65} y1={size * 0.28} x2={size * 0.67} y2={size * 0.22} stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          </>
        ) : (
          <>
            {/* Eye white fill */}
            <ellipse
              cx={size / 2}
              cy={size * 0.38}
              rx={size / 2 - 2.5}
              ry={size * 0.3}
              fill="#f8fafc"
              stroke="#94a3b8"
              strokeWidth="1.4"
            />

            {/* Iris ring */}
            <circle
              cx={cx}
              cy={cy}
              r={size * 0.16}
              fill="#475569"
              style={{ transition: 'cx 0.07s ease-out, cy 0.07s ease-out' }}
            />

            {/* Pupil */}
            <circle
              cx={cx}
              cy={cy}
              r={size * 0.08}
              fill="#1e293b"
              style={{ transition: 'cx 0.07s ease-out, cy 0.07s ease-out' }}
            />

            {/* Subtle light reflection */}
            <circle
              cx={cx + size * 0.05}
              cy={cy - size * 0.05}
              r={size * 0.03}
              fill="white"
              opacity="0.5"
              style={{ transition: 'cx 0.07s ease-out, cy 0.07s ease-out' }}
            />
          </>
        )}
      </svg>
    </div>
  );
}
