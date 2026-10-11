import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ATMOSPHERE_PALETTES = {
  aurora: {
    name: 'Executive Azure',
    primary: '#0A66C2',
    secondary: '#38BDF8',
    accent: '#6366F1',
    waveSpeed: 1.0,
    lightIntensity: '0.85'
  },
  emerald: {
    name: 'Emerald Precision',
    primary: '#10B981',
    secondary: '#06B6D4',
    accent: '#34D399',
    waveSpeed: 0.9,
    lightIntensity: '0.80'
  },
  violet: {
    name: 'Cosmic Amethyst',
    primary: '#8B5CF6',
    secondary: '#EC4899',
    accent: '#C084FC',
    waveSpeed: 1.2,
    lightIntensity: '0.90'
  },
  gold: {
    name: 'Solar Champagne',
    primary: '#F59E0B',
    secondary: '#FB923C',
    accent: '#FDE047',
    waveSpeed: 0.8,
    lightIntensity: '0.75'
  }
};

export default function ThreeBackground({ isDark = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if dark mode is active from html class or prop
    const isDarkMode = isDark || document.documentElement.classList.contains('dark');

    // Retrieve saved atmosphere
    const savedAtmosphereKey = localStorage.getItem('workmark_atmosphere') || 'aurora';
    let currentPalette = ATMOSPHERE_PALETTES[savedAtmosphereKey] || ATMOSPHERE_PALETTES.aurora;

    // Scene & Camera
    const scene = new THREE.Scene();
    const fogColor = isDarkMode ? 0x0B0F19 : 0xF8FAFC;
    scene.fog = new THREE.FogExp2(fogColor, 0.009);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, -10, 80);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Ethereal 3D Undulating Wave Ribbon
    const waveWidth = 220;
    const waveHeight = 130;
    const waveGeometry = new THREE.PlaneGeometry(waveWidth, waveHeight, 64, 40);

    const wavePosAttr = waveGeometry.attributes.position;
    const origX = new Float32Array(wavePosAttr.count);
    const origY = new Float32Array(wavePosAttr.count);
    for (let i = 0; i < wavePosAttr.count; i++) {
      origX[i] = wavePosAttr.getX(i);
      origY[i] = wavePosAttr.getY(i);
    }

    const waveColor = new THREE.Color(currentPalette.primary);
    const waveMat = new THREE.MeshBasicMaterial({
      color: waveColor,
      wireframe: true,
      transparent: true,
      opacity: isDarkMode ? 0.22 : 0.12,
      blending: isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending
    });

    const waveMesh = new THREE.Mesh(waveGeometry, waveMat);
    waveMesh.rotation.x = -Math.PI / 2.7;
    waveMesh.position.y = -22;
    waveMesh.position.z = -15;
    scene.add(waveMesh);

    // Secondary Soft Wave Ribbon
    const ribbonColor = isDarkMode ? 0x8B5CF6 : 0x38BDF8;
    const ribbonMat = new THREE.MeshBasicMaterial({
      color: ribbonColor,
      wireframe: true,
      transparent: true,
      opacity: isDarkMode ? 0.15 : 0.08,
      blending: isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    const ribbonMesh = new THREE.Mesh(waveGeometry.clone(), ribbonMat);
    ribbonMesh.rotation.x = -Math.PI / 2.5;
    ribbonMesh.position.y = -26;
    ribbonMesh.position.z = -25;
    scene.add(ribbonMesh);

    // Soft Floating Light Particles
    const particlesCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particlesCount * 3);
    const particleColors = new Float32Array(particlesCount * 3);

    const c1 = new THREE.Color(isDarkMode ? '#06B6D4' : '#0A66C2');
    const c2 = new THREE.Color(isDarkMode ? '#8B5CF6' : '#6366F1');

    for (let i = 0; i < particlesCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 220;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 160;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 100 - 10;

      const mixed = i % 2 === 0 ? c1 : c2;
      particleColors[i * 3] = mixed.r;
      particleColors[i * 3 + 1] = mixed.g;
      particleColors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: isDarkMode ? 1.6 : 1.2,
      vertexColors: true,
      transparent: true,
      opacity: isDarkMode ? 0.6 : 0.35,
      blending: isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Tracking for Gentle Parallax
    let mouseNormX = 0;
    let mouseNormY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      mouseNormX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNormY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix;
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime() * 0.7;

      targetX += (mouseNormX * 15 - targetX) * 0.05;
      targetY += (mouseNormY * 10 - targetY) * 0.05;

      // Displace Wave Vertices with smooth organic ripples
      const pos = waveGeometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = origX[i];
        const v = origY[i];
        const waveZ =
          Math.sin(u * 0.035 + time * 1.1) * 4.5 +
          Math.cos(v * 0.045 + time * 0.8) * 3.5;
        pos.setZ(i, waveZ);
      }
      pos.needsUpdate = true;

      // Gentle camera parallax
      camera.position.x = targetX * 0.2;
      camera.position.y = -10 + targetY * 0.15;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleAtmosphereChange = (e) => {
      const newKey = e.detail?.theme;
      const palette = ATMOSPHERE_PALETTES[newKey];
      if (palette) {
        waveMat.color.set(palette.primary);
        ribbonMat.color.set(palette.secondary);
      }
    };
    window.addEventListener('workmark-atmosphere-change', handleAtmosphereChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('workmark-atmosphere-change', handleAtmosphereChange);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      waveGeometry.dispose();
      waveMat.dispose();
      ribbonMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
      style={{ opacity: 0.9 }}
    />
  );
}
