import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles } from 'lucide-react';

export default function Interactive3DPrism({ className = '', title = 'Workmark Talent Nexus' }) {
  const mountRef = useRef(null);
  const [pulseCount, setPulseCount] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 240;
    const height = mountRef.current.clientHeight || 200;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Core Crystal (Icosahedron)
    const crystalGeo = new THREE.IcosahedronGeometry(2.4, 0);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x06B6D4,
      emissive: 0x6366F1,
      emissiveIntensity: 0.45,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
      wireframe: false
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    scene.add(crystal);

    // Wireframe Cage for Holographic Tech Look
    const wireGeo = new THREE.IcosahedronGeometry(2.48, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00F2FE,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireframe);

    // Inner Glowing Core Light Orb
    const coreGeo = new THREE.SphereGeometry(1.0, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Orbital Light Rings
    const ringGeo1 = new THREE.TorusGeometry(3.6, 0.04, 16, 80);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x06B6D4,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    scene.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(4.2, 0.03, 16, 80);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x8B5CF6,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 2.5;
    scene.add(ring2);

    // Orbiting Satellite Light Nodes
    const satelliteCount = 5;
    const satellites = [];
    for (let i = 0; i < satelliteCount; i++) {
      const satGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const satMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x06B6D4 : 0xEC4899,
        blending: THREE.AdditiveBlending
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      scene.add(sat);
      satellites.push({
        mesh: sat,
        radius: 3.4 + i * 0.4,
        speed: 0.8 + i * 0.3,
        phase: (i * Math.PI * 2) / satelliteCount
      });
    }

    // Dynamic Lights
    const pointLight = new THREE.PointLight(0x06B6D4, 3, 20);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x6366F1, 1.2);
    scene.add(ambientLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isHovered = false;

    const handleMouseMove = (e) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 3;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 3;
    };

    const handleMouseEnter = () => { isHovered = true; };
    const handleMouseLeave = () => {
      isHovered = false;
      mouseX = 0;
      mouseY = 0;
    };

    const dom = mountRef.current;
    dom.addEventListener('mousemove', handleMouseMove);
    dom.addEventListener('mouseenter', handleMouseEnter);
    dom.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.08;
      targetY += (mouseY - targetY) * 0.08;

      const rotSpeed = isHovered ? 1.6 : 0.8;

      crystal.rotation.y = time * 0.6 * rotSpeed + targetX;
      crystal.rotation.x = time * 0.4 * rotSpeed + targetY;

      wireframe.rotation.y = crystal.rotation.y;
      wireframe.rotation.x = crystal.rotation.x;

      ring1.rotation.z = time * 0.7;
      ring1.rotation.y = time * 0.4;

      ring2.rotation.z = -time * 0.5;
      ring2.rotation.x = Math.PI / 2.5 + Math.sin(time) * 0.2;

      // Pulse inner core
      const pulse = 1 + Math.sin(time * 3) * 0.15;
      core.scale.set(pulse, pulse, pulse);
      pointLight.intensity = 2.5 + Math.sin(time * 4) * 1.2;

      // Orbiting satellites
      satellites.forEach((sat) => {
        const angle = time * sat.speed + sat.phase;
        sat.mesh.position.x = Math.cos(angle) * sat.radius;
        sat.mesh.position.y = Math.sin(angle * 1.2) * 1.2;
        sat.mesh.position.z = Math.sin(angle) * sat.radius;
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousemove', handleMouseMove);
      dom.removeEventListener('mouseenter', handleMouseEnter);
      dom.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      if (dom && renderer.domElement) {
        dom.removeChild(renderer.domElement);
      }
      crystalGeo.dispose();
      crystalMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      renderer.dispose();
    };
  }, []);

  const handleTriggerPulse = () => {
    setPulseCount((c) => c + 1);
  };

  return (
    <div
      onClick={handleTriggerPulse}
      className={`relative rounded-3xl glass-panel hologram-border p-4 flex flex-col items-center justify-center cursor-pointer group hover:border-brand-cyan/60 transition-all ${className}`}
      title="Click to pulse 3D Talent Nexus"
    >
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-44 relative flex items-center justify-center" />

      {/* Meta Label */}
      <div className="text-center mt-1 z-10">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-white group-hover:text-brand-cyan transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
          <span>{title}</span>
        </div>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
          Interactive 3D Photonic Core · {pulseCount > 0 ? `${pulseCount} Pulses Synced` : 'Hover & Drag'}
        </p>
      </div>

      {/* Subtle pulsing background glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-brand-cyan/10 via-transparent to-brand-indigo/10 pointer-events-none -z-0" />
    </div>
  );
}
