import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Compass,
  ArrowLeft,
  Sparkles,
  Bot,
  Send,
  Volume2,
  VolumeX,
  Layers,
  Box,
  Eye,
  Crosshair,
  Maximize2,
  Terminal,
  ExternalLink,
  Code2,
  GraduationCap,
  Briefcase,
  X,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useMusic } from '../../context/MusicContext.tsx';
import { soundFx } from '../../utils/audio.ts';

interface Infinity3DWorldProps {
  onExit: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const Infinity3DWorld: React.FC<Infinity3DWorldProps> = ({ onExit }) => {
  const { data } = useTheme();
  const { isPlaying, togglePlay, currentTrack } = useMusic();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active Station inspection modal state
  const [activeStation, setActiveStation] = useState<'bio' | 'projects' | 'skills' | 'journey' | 'contact' | null>(null);
  const [hudView, setHudView] = useState<'normal' | 'cinematic' | 'wireframe'>('normal');

  // Customer Interaction AI Assistant Console state
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Greetings, Traveler. I am JUBIN-AI, the cybernetic intelligence custodian of this Infinity 3D Universe. How may I assist you today? You can ask about Mr. Jubin's architectural services, skills, project case studies, or dispatch a direct inquiry.`,
      timestamp: '00:01'
    }
  ]);
  const [aiTyping, setAiTyping] = useState(false);

  // 3D Scene Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const stationMeshes = useRef<{ [key: string]: THREE.Object3D }>({});

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    soundFx.click();
    setAiTyping(true);

    // Intelligent context-aware AI Persona responses based on Jubin's live portfolio data
    setTimeout(() => {
      let reply = '';
      const lower = userText.toLowerCase();

      if (lower.includes('project') || lower.includes('work') || lower.includes('portfolio')) {
        const topProjects = data?.projects.map(p => p.title).join(', ') || 'Quantum HUD, Abyssal Vault, NeuralSynth';
        reply = `Mr. Jubin has engineered multiple high-performance production systems, including: ${topProjects}. You can click the floating "PROJECTS NEXUS" station in this 3D world to inspect interactive dossiers and live metrics!`;
      } else if (lower.includes('hire') || lower.includes('contact') || lower.includes('email') || lower.includes('reach') || lower.includes('availab')) {
        reply = `Mr. Jubin is currently ${data?.profile.availability || 'Available for Principal Engineering & Spatial Web Contracts'}. You can reach him directly at ${data?.profile.email || 'jubinkuli009@gmail.com'} or use the TRANSMISSION BEACON in the bottom right.`;
      } else if (lower.includes('skill') || lower.includes('stack') || lower.includes('tech') || lower.includes('three') || lower.includes('react')) {
        reply = `Jubin specializes in: React 19, Three.js & WebGL 2.0, GLSL Shaders, TypeScript, Node.js / Express, High-throughput Cloud Systems, and AI Integrations. Click the "SKILLS CONSTELLATION" orb to see detailed proficiency meters!`;
      } else if (lower.includes('who') || lower.includes('about') || lower.includes('jubin') || lower.includes('experience')) {
        reply = `${data?.profile.name || 'Jubin'} is a ${data?.profile.title || 'Principal Full-Stack & 3D Web Architect'} with 6+ years of experience crafting zero-latency interactive universes and robust cloud architectures.`;
      } else if (lower.includes('song') || lower.includes('music') || lower.includes('audio')) {
        reply = `The current soundtrack is "${currentTrack?.title || 'Cyberpunk Odyssey'}". You can toggle music or change tracks from the bottom left Audio Capsule or through the Admin Studio!`;
      } else {
        reply = `Understood. Mr. Jubin's architectural core is primed for innovative engineering challenges. Would you like to inspect his featured projects, view technical skills, or send an encrypted message?`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setAiTyping(false);
      soundFx.success();
    }, 650);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.012);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, 15, 45);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x0a192f, 2.5);
    scene.add(ambientLight);

    const primaryLight = new THREE.PointLight(0x00f0ff, 4, 120);
    primaryLight.position.set(0, 20, 0);
    scene.add(primaryLight);

    const secondaryLight = new THREE.PointLight(0x38bdf8, 3, 100);
    secondaryLight.position.set(30, -10, 20);
    scene.add(secondaryLight);

    // 5. Infinite Starfield / Quantum Particle Field
    const particleCount = 2500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 250;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 150;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 250;

      const c = Math.random();
      if (c > 0.6) {
        particleColors[i * 3] = 0;
        particleColors[i * 3 + 1] = 0.94;
        particleColors[i * 3 + 2] = 1;
      } else if (c > 0.3) {
        particleColors[i * 3] = 0.05;
        particleColors[i * 3 + 1] = 0.58;
        particleColors[i * 3 + 2] = 0.53;
      } else {
        particleColors[i * 3] = 0.8;
        particleColors[i * 3 + 1] = 0.85;
        particleColors[i * 3 + 2] = 0.95;
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const starField = new THREE.Points(particleGeo, particleMat);
    scene.add(starField);

    // 6. Holographic Cyber Grid Matrix (Floor)
    const gridHelper = new THREE.GridHelper(200, 60, 0x00f0ff, 0x0f172a);
    gridHelper.position.y = -12;
    scene.add(gridHelper);

    // 7. Interactive Floating Stations / Nexus Orbs
    const stations = [
      { key: 'bio', name: 'BIO-CORE & PHILOSOPHY', pos: [0, 5, 0], color: 0x00f0ff, geom: new THREE.IcosahedronGeometry(4, 2) },
      { key: 'projects', name: 'PROJECTS NEXUS', pos: [-24, 8, -10], color: 0x38bdf8, geom: new THREE.TorusGeometry(3.2, 1, 16, 50) },
      { key: 'skills', name: 'SKILLS CONSTELLATION', pos: [24, 7, -10], color: 0x14b8a6, geom: new THREE.OctahedronGeometry(3.5, 2) },
      { key: 'journey', name: 'JOURNEY HORIZON', pos: [-18, 4, 20], color: 0xf59e0b, geom: new THREE.DodecahedronGeometry(3.2) },
      { key: 'contact', name: 'TRANSMISSION BEACON', pos: [18, 5, 20], color: 0xa855f7, geom: new THREE.TetrahedronGeometry(3.5) }
    ];

    stations.forEach(st => {
      const group = new THREE.Group();
      group.position.set(st.pos[0], st.pos[1], st.pos[2]);

      // Inner Core
      const mat = new THREE.MeshStandardMaterial({
        color: st.color,
        emissive: st.color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
        wireframe: false
      });
      const mesh = new THREE.Mesh(st.geom, mat);
      group.add(mesh);

      // Outer Wireframe Cage
      const wireMat = new THREE.MeshBasicMaterial({
        color: st.color,
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
      const wireMesh = new THREE.Mesh(st.geom, wireMat);
      wireMesh.scale.set(1.25, 1.25, 1.25);
      group.add(wireMesh);

      // Light ring
      const ringGeo = new THREE.RingGeometry(5, 5.3, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: st.color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      group.userData = { key: st.key, name: st.name };
      scene.add(group);
      stationMeshes.current[st.key] = group;
    });

    // 8. Mouse / Touch Orbit & Raycasting Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 15;
    let targetCameraZ = 45;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetCameraX = mouseX * 25;
      targetCameraY = 15 + mouseY * 12;
    };

    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      // Don't intercept if clicking inside chat console or UI buttons
      if ((e.target as HTMLElement).closest('.hud-overlay')) return;

      mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseVector, camera);

      const interactiveObjects: THREE.Object3D[] = [];
      Object.values(stationMeshes.current).forEach((g: THREE.Object3D) => {
        if (g && g.children) {
          interactiveObjects.push(...g.children);
        }
      });

      const intersects = raycaster.intersectObjects(interactiveObjects, true);
      if (intersects.length > 0) {
        let root: THREE.Object3D | null = intersects[0].object;
        while (root && root.parent && !(root.parent instanceof THREE.Scene)) {
          root = root.parent;
        }
        if (root && root.userData && root.userData.key) {
          soundFx.portalWarp();
          setActiveStation(root.userData.key as any);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // 9. Render Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera lerp
      camera.position.x += (targetCameraX - camera.position.x) * 0.04;
      camera.position.y += (targetCameraY - camera.position.y) * 0.04;
      camera.lookAt(0, 4, 0);

      // Rotate Starfield
      starField.rotation.y = elapsedTime * 0.02;
      gridHelper.position.z = (elapsedTime * 4) % 10;

      // Animate Stations
      Object.entries(stationMeshes.current).forEach(([, groupObj], idx) => {
        const group = groupObj as THREE.Object3D;
        if (group) {
          group.rotation.y = elapsedTime * (0.3 + idx * 0.1);
          group.rotation.x = Math.sin(elapsedTime + idx) * 0.2;
          group.position.y = (stations[idx]?.pos[1] || 5) + Math.sin(elapsedTime * 2 + idx) * 0.8;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-mono select-none">
      {/* 3D Canvas Canvas Mount */}
      <div ref={containerRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Futuristic HUD Header Overlay */}
      <header className="hud-overlay absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.click();
              onExit();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950 text-xs font-bold transition shadow-[0_0_20px_rgba(0,240,255,0.2)] backdrop-blur-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO PORTFOLIO</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>INFINITY 3D UNIVERSE: ACTIVE</span>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Teleport Station Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1.5 rounded-2xl backdrop-blur-md text-[11px]">
            <button
              onClick={() => setActiveStation('bio')}
              className="px-2.5 py-1 rounded-xl hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 transition"
            >
              Bio-Core
            </button>
            <button
              onClick={() => setActiveStation('projects')}
              className="px-2.5 py-1 rounded-xl hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 transition"
            >
              Projects Nexus
            </button>
            <button
              onClick={() => setActiveStation('skills')}
              className="px-2.5 py-1 rounded-xl hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 transition"
            >
              Skills Constellation
            </button>
            <button
              onClick={() => setActiveStation('journey')}
              className="px-2.5 py-1 rounded-xl hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 transition"
            >
              Journey
            </button>
            <button
              onClick={() => setActiveStation('contact')}
              className="px-2.5 py-1 rounded-xl hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 transition"
            >
              Beacon
            </button>
          </div>

          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`p-2.5 rounded-2xl border transition backdrop-blur-xl flex items-center gap-2 text-xs font-bold ${
              chatOpen
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-cyan-500/40'
            }`}
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">CYBER ASSISTANT</span>
          </button>
        </div>
      </header>

      {/* Floating Instructions & Crosshair Indicator */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
        <div className="px-4 py-1.5 rounded-full bg-slate-950/80 border border-cyan-500/30 text-[11px] text-cyan-300 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.15)] flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 animate-spin" />
          <span>MOVE MOUSE TO NAVIGATE • CLICK ANY FLOATING ORB TO INSPECT DOSSIERS</span>
        </div>
      </div>

      {/* Customer Interaction Console (Interactive AI Chat in 3D World) */}
      {chatOpen && (
        <div className="hud-overlay absolute bottom-6 right-6 z-30 w-[92vw] sm:w-[380px] max-h-[500px] h-[75vh] sm:h-[460px] rounded-3xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden text-xs">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-cyan-950/40 to-slate-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-white tracking-wider flex items-center gap-1.5">
                  <span>JUBIN-AI CUSTODIAN</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-[10px] text-cyan-400">Customer & Discovery Interface</div>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-cyan-400" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-slate-950 font-medium'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {aiTyping && (
              <div className="flex items-center gap-2 text-cyan-400 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span>JUBIN-AI is synthesizing response...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => setChatInput('What are your top projects?')}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 whitespace-nowrap"
            >
              🚀 Top Projects
            </button>
            <button
              onClick={() => setChatInput('What is your tech stack?')}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 whitespace-nowrap"
            >
              ⚡ Tech Stack
            </button>
            <button
              onClick={() => setChatInput('How do I hire Mr. Jubin?')}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 whitespace-nowrap"
            >
              💼 Hire Jubin
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask anything about Jubin's work or services..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 font-sans"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Station Holographic Dossier Modal */}
      {activeStation && (
        <div className="hud-overlay absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.3s_ease]">
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-slate-950 border border-cyan-500/50 p-6 shadow-[0_0_50px_rgba(0,240,255,0.3)] overflow-y-auto space-y-5 text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <Box className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
                    3D STATION TELEMETRY
                  </span>
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">
                    {activeStation === 'bio' && 'BIO-CORE & IDENTITY MATRIX'}
                    {activeStation === 'projects' && 'FEATURED PROJECTS NEXUS'}
                    {activeStation === 'skills' && 'SKILLS & TECH CONSTELLATION'}
                    {activeStation === 'journey' && 'EXPEDITION MILESTONES'}
                    {activeStation === 'contact' && 'DIRECT TRANSMISSION BEACON'}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveStation(null)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Station Content */}
            {activeStation === 'bio' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={data?.profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={data?.profile.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-white">{data?.profile.name}</h4>
                    <p className="text-xs text-cyan-300 font-mono">{data?.profile.title}</p>
                    <p className="text-xs text-slate-400">{data?.profile.location} • {data?.profile.availability}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {data?.profile.aboutMe || data?.profile.biography}
                </p>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">ARCHITECTURAL PHILOSOPHY</span>
                  <p className="text-xs text-slate-200 italic font-sans">
                    "{data?.profile.philosophy}"
                  </p>
                </div>
              </div>
            )}

            {activeStation === 'projects' && (
              <div className="space-y-3">
                {data?.projects.map(proj => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                        {proj.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-lg bg-slate-950 text-[10px] text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeStation === 'skills' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data?.skills.map(sk => (
                  <div key={sk.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{sk.name}</span>
                      <span className="text-xs text-cyan-300 font-bold">{sk.level}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full rounded-full" style={{ width: `${sk.level}%` }}></div>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase">{sk.category}</span>
                  </div>
                ))}
              </div>
            )}

            {activeStation === 'journey' && (
              <div className="space-y-3">
                {data?.journey.map(j => (
                  <div key={j.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400">{j.year}</span>
                      <span className="text-slate-500 text-[10px] uppercase">{j.environmentPhase}</span>
                    </div>
                    <div className="font-bold text-white text-sm">{j.title}</div>
                    <div className="text-cyan-300 text-xs">{j.companyOrContext}</div>
                    <p className="text-slate-300 font-sans text-xs pt-1">{j.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeStation === 'contact' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 font-sans">
                  Ready to collaborate or deploy custom spatial architectures? Dispatch a message directly to Mr. Jubin:
                </p>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Direct Email:</span>
                    <a href={`mailto:${data?.profile.email}`} className="text-cyan-300 font-bold hover:underline">
                      {data?.profile.email}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Availability:</span>
                    <span className="text-emerald-400 font-bold">{data?.profile.availability}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer Action */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveStation(null)}
                className="px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition"
              >
                CLOSE DOSSIER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
