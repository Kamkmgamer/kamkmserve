'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CosmicVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const frameIdRef = useRef<number>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current; // Capture the ref value

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 8000;

    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      // Create spiral galaxy formation
      const angle = (i / particlesCount) * Math.PI * 20;
      const radius = Math.sqrt(i / particlesCount) * 40;
      const spiralRadius = radius * (1 + Math.sin(angle * 3) * 0.3);

      positions[i * 3] = Math.cos(angle) * spiralRadius;
      positions[i * 3 + 1] = Math.sin(angle) * spiralRadius;
      positions[i * 3 + 2] = (i / particlesCount - 0.5) * 20 + Math.sin(angle * 2) * 5;

      // Color gradient from blue to purple to pink
      const colorProgress = (i / particlesCount);
      if (colorProgress < 0.33) {
        colors[i * 3] = 0.2 + colorProgress * 3; // R: blue to purple
        colors[i * 3 + 1] = 0.5 + colorProgress * 2; // G
        colors[i * 3 + 2] = 0.8 + colorProgress; // B: blue to purple
      } else if (colorProgress < 0.66) {
        colors[i * 3] = 0.8 - (colorProgress - 0.33) * 2; // R: purple to pink
        colors[i * 3 + 1] = 0.5 - (colorProgress - 0.33) * 1.5; // G
        colors[i * 3 + 2] = 0.9 - (colorProgress - 0.33) * 1; // B: purple to pink
      } else {
        colors[i * 3] = 0.9 - (colorProgress - 0.66) * 3; // R: pink to white
        colors[i * 3 + 1] = 0.6 - (colorProgress - 0.66) * 2; // G
        colors[i * 3 + 2] = 0.8 - (colorProgress - 0.66) * 1.5; // B: pink to white
      }

      sizes[i] = Math.random() * 2 + 0.5;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create particle material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    // Create particle system
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Mouse interaction
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.01;

      if (particlesRef.current) {
        // Rotate the entire particle system
        particlesRef.current.rotation.z = time * 0.1;
        particlesRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
        particlesRef.current.rotation.y = Math.cos(time * 0.15) * 0.1;

        // Mouse interaction
        particlesRef.current.rotation.x += mouse.y * 0.02;
        particlesRef.current.rotation.y += mouse.x * 0.02;

        // Dynamic particle movement
        const positionAttribute = particlesRef.current.geometry.attributes.position;
        if (positionAttribute) {
          const positions = positionAttribute.array as Float32Array;
          for (let i = 0; i < positions.length - 2; i += 3) {
            const originalZ = positions[i + 2];
            if (originalZ !== undefined) {
              positions[i + 2] = originalZ + Math.sin(time + i * 0.001) * 2;
            }
          }
          positionAttribute.needsUpdate = true;
        }
      }

      if (cameraRef.current) {
        cameraRef.current.position.x = Math.sin(time * 0.1) * 10;
        cameraRef.current.position.y = Math.cos(time * 0.1) * 10;
        cameraRef.current.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
      }

      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
}
