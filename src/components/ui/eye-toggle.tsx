'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface EyeToggleProps {
  show: boolean;
  onToggle: () => void;
  size?: number;
  primaryColor?: string;
}

export function EyeToggle({ show, onToggle, size = 36, primaryColor = '#3b82f6' }: EyeToggleProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!eyeRef.current || show) return; // Don't track when eye is closed

    const rect = eyeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxMove = size * 0.12; // Max pupil movement

    const ratio = Math.min(distance / 150, 1);
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

  const eyeWidth = size;
  const eyeHeight = size * 0.6;
  const irisSize = size * 0.35;
  const pupilSize = size * 0.18;
  const lidHeight = show ? eyeHeight : 0;

  return (
    <div
      ref={eyeRef}
      className="relative cursor-pointer select-none"
      style={{ width: eyeWidth, height: eyeHeight }}
      onClick={onToggle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      role="button"
      aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      title={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      <svg
        width={eyeWidth}
        height={size}
        viewBox={`0 0 ${eyeWidth} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Eye white (almond shape) */}
        <ellipse
          cx={eyeWidth / 2}
          cy={size / 2}
          rx={eyeWidth / 2 - 2}
          ry={eyeHeight / 2 - 1}
          fill="white"
          stroke={isHovering ? primaryColor : '#d1d5db'}
          strokeWidth="2"
          style={{ transition: 'stroke 0.2s ease' }}
        />

        {/* Iris */}
        {!show && (
          <circle
            cx={eyeWidth / 2 + pupilOffset.x}
            cy={size / 2 + pupilOffset.y}
            r={irisSize / 2}
            fill={primaryColor}
            style={{ transition: 'cx 0.08s ease-out, cy 0.08s ease-out' }}
          />
        )}

        {/* Pupil */}
        {!show && (
          <circle
            cx={eyeWidth / 2 + pupilOffset.x}
            cy={size / 2 + pupilOffset.y}
            r={pupilSize / 2}
            fill="#1a1a2e"
            style={{ transition: 'cx 0.08s ease-out, cy 0.08s ease-out' }}
          />
        )}

        {/* Light reflection */}
        {!show && (
          <circle
            cx={eyeWidth / 2 + pupilOffset.x + irisSize * 0.2}
            cy={size / 2 + pupilOffset.y - irisSize * 0.2}
            r={pupilSize * 0.25}
            fill="white"
            opacity="0.8"
            style={{ transition: 'cx 0.08s ease-out, cy 0.08s ease-out' }}
          />
        )}

        {/* Closed eyelid line */}
        {show && (
          <path
            d={`M 3 ${size / 2} Q ${eyeWidth / 2} ${size / 2 - eyeHeight * 0.15} ${eyeWidth - 3} ${size / 2}`}
            stroke={isHovering ? primaryColor : '#9ca3af'}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            style={{ transition: 'stroke 0.2s ease' }}
          />
        )}

        {/* Eyelashes (top) - only when open */}
        {!show && (
          <>
            <line x1={eyeWidth * 0.2} y1={size / 2 - eyeHeight / 2 + 2} x2={eyeWidth * 0.15} y2={size / 2 - eyeHeight / 2 - 4} stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
            <line x1={eyeWidth * 0.35} y1={size / 2 - eyeHeight / 2 + 1} x2={eyeWidth * 0.33} y2={size / 2 - eyeHeight / 2 - 5} stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
            <line x1={eyeWidth * 0.5} y1={size / 2 - eyeHeight / 2} x2={eyeWidth * 0.5} y2={size / 2 - eyeHeight / 2 - 6} stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
            <line x1={eyeWidth * 0.65} y1={size / 2 - eyeHeight / 2 + 1} x2={eyeWidth * 0.67} y2={size / 2 - eyeHeight / 2 - 5} stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
            <line x1={eyeWidth * 0.8} y1={size / 2 - eyeHeight / 2 + 2} x2={eyeWidth * 0.85} y2={size / 2 - eyeHeight / 2 - 4} stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  );
}
