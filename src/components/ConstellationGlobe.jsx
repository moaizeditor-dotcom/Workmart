import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { networkNodes } from '../data/mockData';
import { UserCheck, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

export default function ConstellationGlobe({ nodes = [], onSelectNode }) {
  const mountRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = 480;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Group for the entire rotating constellation
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Outer spherical wireframe / latitude rings
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x6366F1,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const sphereGeo = new THREE.SphereGeometry(40, 24, 24);
    const wireSphere = new THREE.Mesh(sphereGeo, ringMat);
    globeGroup.add(wireSphere);

    // Ambient floating particles on globe surface
    const particleCount = 240;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 40 + (Math.random() - 0.5) * 4;

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 1.2,
      color: 0x06B6D4,
      transparent: true,
      opacity: 0.6
    });
    const ambientPoints = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(ambientPoints);

    // Talent Nodes (Interactive Mesh)
    const nodeMeshes = [];
    const nodeDataMap = new Map();

    const nodeGeometry = new THREE.SphereGeometry(2.4, 16, 16);
    const activeNodes = Array.isArray(nodes) ? nodes : [];

    activeNodes.forEach((node, idx) => {
      // Map coordinates around the sphere
      const phi = (idx / (activeNodes.length || 1)) * Math.PI * 2;
      const theta = ((idx % 3) + 1) * (Math.PI / 4);
      const r = 40;

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.cos(theta);
      const z = r * Math.sin(theta) * Math.sin(phi);

      const color = node.score > 98 ? 0x06B6D4 : 0x6366F1;
      const nodeMaterial = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: false
      });

      const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      mesh.position.set(x, y, z);
      globeGroup.add(mesh);

      // Outer glow pulse ring
      const pulseGeo = new THREE.RingGeometry(2.6, 3.8, 24);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      pulseMesh.position.set(x, y, z);
      pulseMesh.lookAt(0, 0, 0);
      globeGroup.add(pulseMesh);

      nodeMeshes.push(mesh);
      nodeDataMap.set(mesh.id, node);
    });

    // Connecting Arcs / Network Lines between Nodes
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6366F1,
      transparent: true,
      opacity: 0.28
    });

    for (let i = 0; i < nodeMeshes.length; i++) {
      for (let j = i + 1; j < nodeMeshes.length; j++) {
        const p1 = nodeMeshes[i].position;
        const p2 = nodeMeshes[j].position;

        // Quadratic curve arching outward from center
        const midPoint = new THREE.Vector3()
          .addVectors(p1, p2)
          .multiplyScalar(0.5)
          .normalize()
          .multiplyScalar(46);

        const curve = new THREE.QuadraticBezierCurve3(p1, midPoint, p2);
        const points = curve.getPoints(24);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMesh = new THREE.Line(lineGeo, lineMat);
        globeGroup.add(lineMesh);
      }
    }

    // Mouse Interaction: Drag to Rotate & Raycasting
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0.002, y: 0.005 };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        globeGroup.rotation.y += deltaX * 0.008;
        globeGroup.rotation.x += deltaY * 0.008;

        rotationVelocity = {
          x: deltaY * 0.002,
          y: deltaX * 0.002
        };

        previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        // Raycasting for hover tooltip
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodeMeshes);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object;
          const data = nodeDataMap.get(hitMesh.id);
          if (data) {
            setHoveredNode(data);
            renderer.domElement.style.cursor = 'pointer';
          }
        } else {
          setHoveredNode(null);
          renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const data = nodeDataMap.get(hitMesh.id);
        if (data) {
          setSelectedNode(data);
          if (onSelectNode) onSelectNode(data);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('click', onClick);

    // Animation Loop
    let animId;
    const animate = () => {
      if (!isDragging) {
        globeGroup.rotation.y += rotationVelocity.y;
        globeGroup.rotation.x += rotationVelocity.x;

        // Damping velocity
        rotationVelocity.x *= 0.98;
        rotationVelocity.y *= 0.98;

        if (Math.abs(rotationVelocity.y) < 0.002) rotationVelocity.y = 0.002;
        if (Math.abs(rotationVelocity.x) < 0.0005) rotationVelocity.x = 0.0005;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative rounded-3xl glass-panel hologram-border p-6 overflow-hidden">
      {/* 3D Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-ping" />
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              The 3D Constellation
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-indigo/30 text-brand-indigo font-mono border border-brand-indigo/40">
                LIVE SPATIAL GRAPH
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive multi-tier professional network graph. Drag to rotate in 3D, click any node to inspect verified dossier.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['All', 'AI & Research', 'Executive', 'Systems & Security'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-brand-indigo text-white shadow-lg shadow-brand-indigo/30'
                  : 'bg-void-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Three.js Container */}
      <div className="relative w-full h-[480px] rounded-2xl bg-void-950/80 overflow-hidden border border-slate-800/80">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Ambient HUD Overlay */}
        <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1 font-mono text-[11px] text-slate-400 bg-void-900/60 p-2.5 rounded-xl border border-slate-800/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-cyan" />
            <span>Active Peers: 148,920</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-indigo" />
            <span>Cluster Density: 99.4%</span>
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredNode && !selectedNode && (
          <div className="absolute top-4 right-4 bg-void-900/90 border border-brand-cyan/40 p-3 rounded-xl shadow-2xl backdrop-blur-md max-w-xs animate-fade-in pointer-events-none">
            <div className="flex items-center gap-2.5">
              <img src={hoveredNode.avatar} alt={hoveredNode.name} className="w-9 h-9 rounded-full object-cover border border-brand-cyan/50" />
              <div>
                <h4 className="text-xs font-bold text-white">{hoveredNode.name}</h4>
                <p className="text-[11px] text-slate-400 truncate">{hoveredNode.role}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-brand-cyan font-bold">{hoveredNode.score} WM</span>
                  <span className="text-[10px] text-slate-500">· {hoveredNode.mutual} mutuals</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Node Drawer / Modal */}
        {selectedNode && (
          <div className="absolute inset-y-4 right-4 w-80 bg-void-900/95 border border-brand-indigo/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col justify-between z-20 animate-fade-in">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={selectedNode.avatar} alt={selectedNode.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-indigo shadow-md" />
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {selectedNode.name}
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
                    </h4>
                    <p className="text-xs text-brand-cyan/90 font-medium">{selectedNode.role}</p>
                    <p className="text-[11px] text-slate-400">{selectedNode.company}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-void-800"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-void-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Workmark Score</span>
                  <span className="font-mono font-bold text-brand-cyan">{selectedNode.score} / 100</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-slate-400">Total Connections</span>
                  <span className="font-mono text-slate-200">{selectedNode.connections.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-slate-400">Mutual Peers</span>
                  <span className="font-mono text-brand-indigo font-semibold">{selectedNode.mutual} verified</span>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Domain</span>
                <div className="mt-1 inline-block px-2.5 py-1 rounded-lg bg-brand-indigo/20 text-brand-indigo text-xs font-medium border border-brand-indigo/30">
                  {selectedNode.category}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  alert(`Connection invitation sent to ${selectedNode.name} with your Workmark Proof.`);
                  setSelectedNode(null);
                }}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-cyan text-white text-xs font-semibold shadow-lg shadow-brand-indigo/30 hover:opacity-95 transition-opacity"
              >
                Connect
              </button>
              <button
                onClick={() => alert(`Opening encrypted Direct Wire with ${selectedNode.name}...`)}
                className="px-3 py-2 rounded-xl bg-void-800 hover:bg-void-700 text-slate-300 text-xs font-medium border border-slate-700"
              >
                Message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
