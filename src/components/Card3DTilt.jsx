import React, { useRef, useState } from 'react';
import BorderBeam from './BorderBeam';

export default function Card3DTilt({
  children,
  className = '',
  maxTilt = 8,
  glowColor = 'rgba(6, 182, 212, 0.22)',
  borderBeam = false,
  borderBeamDuration = 7,
  onClick
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glossX: 50, glossY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glossX = (x / rect.width) * 100;
    const glossY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glossX, glossY });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, glossX: 50, glossY: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-4px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
      }}
      className={`relative transform-style-3d group cursor-pointer ${className}`}
    >
      {/* 3D Border Beam Light Effect if enabled */}
      {borderBeam && (
        <BorderBeam
          duration={borderBeamDuration}
          colorFrom="#06B6D4"
          colorTo="#8B5CF6"
        />
      )}

      {/* 3D Dynamic Specular Light Glare Overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${tilt.glossX}% ${tilt.glossY}%, ${glowColor}, transparent 65%)`
        }}
      />

      {/* 3D Angular Light Reflection Sheen */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 z-0"
        style={{
          opacity: isHovered ? 0.35 : 0,
          background: `linear-gradient(${tilt.rotateY * 10 + 45}deg, transparent 30%, rgba(255, 255, 255, 0.12) 50%, transparent 70%)`
        }}
      />

      {children}
    </div>
  );
}
