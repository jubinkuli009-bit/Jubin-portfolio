import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext.tsx';

export const UnderwaterCanvas3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, effectiveMode } = useTheme();

  useEffect(() => {
    if (!containerRef.current || effectiveMode === '2D') return;

    const container = containerRef.current;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: data?.studio3D.qualityPreset !== 'LOW',
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch {
      console.warn('WebGL initialization failed, falling back to 2D.');
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, data?.studio3D.qualityPreset === 'ULTRA' ? 2 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 7;

    // Fog configuration
    const fogDensity = data?.studio3D.fogDensity || 0.018;
    const fogColor = new THREE.Color(data?.studio3D.fogColor || '#020617');
    scene.fog = new THREE.FogExp2(fogColor, fogDensity);

    // ==========================================
    // LIGHTING SYSTEM (Underwater Caustics)
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0x0a192f, 1.5);
    scene.add(ambientLight);

    const primaryColorHex = data?.studio3D.lightPrimaryColor || '#00f0ff';
    const secondaryColorHex = data?.studio3D.lightSecondaryColor || '#38bdf8';

    const light1 = new THREE.PointLight(primaryColorHex, 3.5, 30);
    light1.position.set(4, 6, 4);
    scene.add(light1);

    const light2 = new THREE.PointLight(secondaryColorHex, 2.8, 25);
    light2.position.set(-5, -4, -2);
    scene.add(light2);

    const topSunlight = new THREE.DirectionalLight(0x67e8f9, 2.0);
    topSunlight.position.set(0, 15, 5);
    scene.add(topSunlight);

    // ==========================================
    // CENTRAL 3D / 4D OBJECT (Quantum Core / Crystal)
    // ==========================================
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreShape = data?.studio3D.coreShape || 'quantum_sphere';
    const sizeMultiplier = data?.studio3D.objectSize || 1.2;

    let mainGeo: THREE.BufferGeometry;
    let innerGeo: THREE.BufferGeometry;

    if (coreShape === 'hyper_crystal') {
      mainGeo = new THREE.OctahedronGeometry(2.0 * sizeMultiplier, 2);
      innerGeo = new THREE.IcosahedronGeometry(1.2 * sizeMultiplier, 1);
    } else if (coreShape === 'cyber_torus') {
      mainGeo = new THREE.TorusKnotGeometry(1.5 * sizeMultiplier, 0.45 * sizeMultiplier, 120, 24);
      innerGeo = new THREE.SphereGeometry(0.9 * sizeMultiplier, 16, 16);
    } else if (coreShape === 'abyssal_ring') {
      mainGeo = new THREE.TorusGeometry(2.2 * sizeMultiplier, 0.25 * sizeMultiplier, 32, 100);
      innerGeo = new THREE.DodecahedronGeometry(1.1 * sizeMultiplier);
    } else {
      // quantum_sphere default
      mainGeo = new THREE.IcosahedronGeometry(1.8 * sizeMultiplier, 4);
      innerGeo = new THREE.IcosahedronGeometry(1.1 * sizeMultiplier, 2);
    }

    // Outer Hologram Shell
    const mainMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(primaryColorHex),
      emissive: new THREE.Color(primaryColorHex),
      emissiveIntensity: 0.25,
      metalness: 0.1,
      roughness: 0.15,
      transmission: 0.75,
      thickness: 1.2,
      wireframe: false,
      transparent: true,
      opacity: 0.85
    });

    const mainMesh = new THREE.Mesh(mainGeo, mainMat);
    coreGroup.add(mainMesh);

    // Inner Luminous Wireframe Core
    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(secondaryColorHex),
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    const innerMesh = new THREE.Mesh(innerGeo, wireMat);
    coreGroup.add(innerMesh);

    // Orbital Quantum Rings
    const ringGeo = new THREE.RingGeometry(2.6 * sizeMultiplier, 2.75 * sizeMultiplier, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(primaryColorHex),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const orbitalRing1 = new THREE.Mesh(ringGeo, ringMat);
    orbitalRing1.rotation.x = Math.PI / 3;
    coreGroup.add(orbitalRing1);

    const orbitalRing2 = new THREE.Mesh(ringGeo, ringMat);
    orbitalRing2.rotation.y = Math.PI / 4;
    coreGroup.add(orbitalRing2);

    // ==========================================
    // BIOLUMINESCENT PARTICLES & DEEP SEA BUBBLES
    // ==========================================
    const particleCount = Math.min(
      data?.studio3D.particleDensity || 650,
      data?.studio3D.qualityPreset === 'LOW' ? 250 : data?.studio3D.qualityPreset === 'ULTRA' ? 1800 : 800
    );

    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;

      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = Math.random() * 0.02 + 0.005; // upward drift (bubbles)
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

      scales[i] = Math.random() * 0.08 + 0.02;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom Particle Sprite Texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(0, 240, 255, 0.8)');
      gradient.addColorStop(0.8, 'rgba(13, 148, 136, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particlesMat = new THREE.PointsMaterial({
      size: 0.35,
      map: particleTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // ==========================================
    // INTERACTION & ANIMATION LOOP
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let scrollProgress = 0;

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      targetMouseX = (clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (clientY / window.innerHeight - 0.5) * 2;
    };

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Smooth mouse inertia
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const rotSpeed = data?.studio3D.rotationSpeed || 0.8;
      const fourDFactor = effectiveMode === '4D' ? 1.4 : 1.0;

      // Core rotations
      coreGroup.rotation.y = elapsed * 0.3 * rotSpeed + mouseX * 0.8;
      coreGroup.rotation.x = elapsed * 0.2 * rotSpeed + mouseY * 0.6 + scrollProgress * Math.PI * 1.5;
      innerMesh.rotation.y = -elapsed * 0.5 * rotSpeed;
      orbitalRing1.rotation.z = elapsed * 0.4 * rotSpeed;
      orbitalRing2.rotation.z = -elapsed * 0.35 * rotSpeed;

      // 4D Mode Temporal Wave Distortion
      if (effectiveMode === '4D') {
        const pulse = Math.sin(elapsed * 2.5) * 0.08;
        coreGroup.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
        light1.intensity = 3.5 + Math.sin(elapsed * 3.0) * 1.2;
        light2.intensity = 2.8 + Math.cos(elapsed * 2.2) * 0.9;
      }

      // Parallax camera displacement
      camera.position.x = mouseX * 0.8;
      camera.position.y = -mouseY * 0.8 - scrollProgress * 2.0;
      camera.lookAt(0, -scrollProgress * 2.0, 0);

      // Bioluminescent particles animation
      const posAttr = particlesGeo.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      const pSpeed = (data?.studio3D.particleSpeed || 0.8) * fourDFactor;
      for (let i = 0; i < particleCount; i++) {
        // drift upward
        posArray[i * 3 + 1] += velocities[i * 3 + 1] * pSpeed;
        posArray[i * 3] += Math.sin(elapsed + i) * 0.005 * pSpeed;

        // wrap around boundary
        if (posArray[i * 3 + 1] > 18) {
          posArray[i * 3 + 1] = -18;
          posArray[i * 3] = (Math.random() - 0.5) * 35;
          posArray[i * 3 + 2] = (Math.random() - 0.5) * 25;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      mainGeo.dispose();
      innerGeo.dispose();
      ringGeo.dispose();
      particlesGeo.dispose();
      mainMat.dispose();
      wireMat.dispose();
      ringMat.dispose();
      particlesMat.dispose();
      particleTexture.dispose();
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [data?.studio3D, effectiveMode]);

  return (
    <div
      ref={containerRef}
      id="jubin-3d-universe-canvas"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        opacity: effectiveMode === '2D' ? 0 : 1,
        transition: 'opacity 0.8s ease-in-out'
      }}
    />
  );
};
