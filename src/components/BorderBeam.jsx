import React from 'react';

/**
 * BorderBeam Component (Inspired by 21st / Aceternity MagicUI)
 * Adds an animated glowing light laser beam that travels along the perimeter of cards.
 */
export default function BorderBeam({
  className = '',
  duration = 7,
  colorFrom = '#06B6D4', // Cyan
  colorTo = '#8B5CF6',   // Violet
  borderWidth = 1.5,
  glowBlur = 4,
}) {
  return (
    <>
      {/* Crisp travelling light beam */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-10 ${className}`}
        style={{
          padding: `${borderWidth}px`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        <div
          className="absolute inset-[-150%] animate-spin-slow origin-center"
          style={{
            animationDuration: `${duration}s`,
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, ${colorFrom} 315deg, ${colorTo} 350deg, #FFFFFF 360deg)`
          }}
        />
      </div>

      {/* Radiant ambient glow blur along border */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden opacity-50 -z-0 ${className}`}
        style={{
          padding: `${borderWidth + 1}px`,
          filter: `blur(${glowBlur}px)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        <div
          className="absolute inset-[-150%] animate-spin-slow origin-center"
          style={{
            animationDuration: `${duration}s`,
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, ${colorFrom} 315deg, ${colorTo} 355deg, #FFFFFF 360deg)`
          }}
        />
      </div>
    </>
  );
}
