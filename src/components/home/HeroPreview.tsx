"use client";
import React, { 
  useCallback, 
  useEffect, 
  useRef, 
  useState, 
  useMemo,
  useId 
} from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Code, 
  Cpu, 
  Database, 
  Globe, 
  Layers, 
  Settings2,
  X,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Eye,
  Palette,
  Volume2,
  VolumeX
} from 'lucide-react';
import { TOKENS, useReducedMotionPref } from '../tokens';

// Enhanced configuration
const PARTICLE_COUNT = 150;
const FLOATING_ELEMENTS = 12;
const NEURAL_NODES = 8;
const STORAGE_KEY = 'hero_preview_settings_v2';

type PreviewMode = 'showcase' | 'code' | 'data' | 'neural' | 'hologram' | 'matrix';

type Settings = {
  mode: PreviewMode;
  intensity: number;
  particles: boolean;
  neural: boolean;
  sound: boolean;
  autoRotate: boolean;
  glitch: boolean;
  hologram: boolean;
  colorScheme: 'cyan' | 'purple' | 'orange' | 'rainbow';
  speed: number;
  depth: number;
  paused: boolean;
};

const defaultSettings: Settings = {
  mode: 'showcase',
  intensity: 0.8,
  particles: true,
  neural: true,
  sound: false,
  autoRotate: true,
  glitch: false,
  hologram: true,
  colorScheme: 'cyan',
  speed: 1,
  depth: 30,
  paused: false,
};

// Particle system
interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'data' | 'neural' | 'energy';
}

// Neural network node
interface NeuralNode {
  id: number;
  x: number;
  y: number;
  connections: number[];
  activity: number;
  pulse: number;
}

const HeroPreview: React.FC = () => {
  const reduce = useReducedMotionPref();
  
  // Refs for 3D interaction
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // 3D rotation state
  const mouseX = useSpring(0, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseY, [-1, 1], [15, -15]);
  const rotateY = useTransform(mouseX, [-1, 1], [-15, 15]);
  
  // Settings state
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentMode, setCurrentMode] = useState<PreviewMode>(settings.mode);
  
  // Animation state
  const [particles, setParticles] = useState<Particle[]>([]);
  const [neuralNodes, setNeuralNodes] = useState<NeuralNode[]>([]);
  const [time, setTime] = useState(0);
  
  const settingsPanelId = useId();
  
  // Save settings to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);
  
  // Initialize particles
  useEffect(() => {
    if (!settings.particles) return;
    
    const newParticles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 800 - 400,
        y: Math.random() * 600 - 300,
        z: Math.random() * 200 - 100,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        life: 0,
        maxLife: 200 + Math.random() * 100,
        size: Math.random() * 3 + 1,
        color: getParticleColor(settings.colorScheme),
        type: ['spark', 'data', 'neural', 'energy'][Math.floor(Math.random() * 4)] as Particle['type']
      });
    }
    setParticles(newParticles);
  }, [settings.particles, settings.colorScheme]);
  
  // Initialize neural network
  useEffect(() => {
    if (!settings.neural) return;
    
    const nodes: NeuralNode[] = [];
    for (let i = 0; i < NEURAL_NODES; i++) {
      const angle = (i / NEURAL_NODES) * Math.PI * 2;
      const radius = 150 + Math.random() * 100;
      nodes.push({
        id: i,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        connections: [],
        activity: Math.random(),
        pulse: 0
      });
    }
    
    // Create connections
    nodes.forEach((node, i) => {
      const connectionCount = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * NEURAL_NODES);
        if (targetIndex !== i && !node.connections.includes(targetIndex)) {
          node.connections.push(targetIndex);
        }
      }
    });
    
    setNeuralNodes(nodes);
  }, [settings.neural]);
  
  // Get particle color based on scheme
  const getParticleColor = (scheme: Settings['colorScheme']): string => {
    const colors = {
      cyan: ['#00f5ff', '#00d4ff', '#0099ff', '#0066ff'],
      purple: ['#a855f7', '#8b5cf6', '#7c3aed', '#6d28d9'],
      orange: ['#f97316', '#ea580c', '#dc2626', '#b91c1c'],
      rainbow: ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff']
    };
    const palette = colors[scheme];
    return palette[Math.floor(Math.random() * palette.length)];
  };
  
  // Color scheme gradients
  const getColorScheme = () => {
    const schemes = {
      cyan: {
        primary: 'from-cyan-400 via-blue-500 to-purple-600',
        secondary: 'from-cyan-500/20 to-blue-600/20',
        accent: 'text-cyan-400',
        glow: 'shadow-cyan-500/25'
      },
      purple: {
        primary: 'from-purple-400 via-pink-500 to-red-500',
        secondary: 'from-purple-500/20 to-pink-600/20',
        accent: 'text-purple-400',
        glow: 'shadow-purple-500/25'
      },
      orange: {
        primary: 'from-orange-400 via-red-500 to-pink-500',
        secondary: 'from-orange-500/20 to-red-600/20',
        accent: 'text-orange-400',
        glow: 'shadow-orange-500/25'
      },
      rainbow: {
        primary: 'from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400',
        secondary: 'from-red-500/10 via-blue-500/10 to-purple-500/10',
        accent: 'text-pink-400',
        glow: 'shadow-pink-500/25'
      }
    };
    return schemes[settings.colorScheme];
  };
  
  const colorScheme = getColorScheme();
  
  // Animation loop
  useEffect(() => {
    if (settings.paused || reduce) return;
    
    let animationId: number;
    
    const animate = () => {
      setTime(prev => prev + settings.speed);
      
      // Update particles
      if (settings.particles) {
        setParticles(prev => prev.map(particle => {
          const newLife = particle.life + 1;
          if (newLife > particle.maxLife) {
            return {
              ...particle,
              x: Math.random() * 800 - 400,
              y: Math.random() * 600 - 300,
              z: Math.random() * 200 - 100,
              life: 0,
              color: getParticleColor(settings.colorScheme)
            };
          }
          
          const gravity = currentMode === 'data' ? -0.1 : 0.05;
          const newVy = particle.vy + gravity;
          
          return {
            ...particle,
            x: particle.x + particle.vx * settings.intensity,
            y: particle.y + newVy * settings.intensity,
            z: particle.z + particle.vz * settings.intensity,
            vy: newVy,
            life: newLife
          };
        }));
      }
      
      // Update neural nodes
      if (settings.neural) {
        setNeuralNodes(prev => prev.map(node => ({
          ...node,
          activity: Math.sin(time * 0.01 + node.id) * 0.5 + 0.5,
          pulse: Math.sin(time * 0.02 + node.id * 0.5) * 0.3 + 0.7
        })));
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [settings, reduce, currentMode, time]);
  
  // Mouse interaction
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || reduce || settings.paused) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY, reduce, settings.paused]);
  
  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);
  
  // Canvas rendering for particles and neural network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || (!settings.particles && !settings.neural)) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Render particles
      if (settings.particles) {
        particles.forEach(particle => {
          const alpha = 1 - (particle.life / particle.maxLife);
          const size = particle.size * alpha;
          
          ctx.save();
          ctx.globalAlpha = alpha * 0.8;
          ctx.fillStyle = particle.color;
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = size * 2;
          
          ctx.beginPath();
          ctx.arc(
            particle.x + canvas.width / 2,
            particle.y + canvas.height / 2,
            size,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.restore();
        });
      }
      
      // Render neural network
      if (settings.neural) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw connections
        neuralNodes.forEach(node => {
          node.connections.forEach(connectionId => {
            const target = neuralNodes[connectionId];
            if (!target) return;
            
            ctx.save();
            ctx.globalAlpha = (node.activity + target.activity) * 0.3;
            ctx.strokeStyle = colorScheme.accent.replace('text-', '#');
            ctx.lineWidth = 2;
            ctx.shadowColor = colorScheme.accent.replace('text-', '#');
            ctx.shadowBlur = 4;
            
            ctx.beginPath();
            ctx.moveTo(node.x + centerX, node.y + centerY);
            ctx.lineTo(target.x + centerX, target.y + centerY);
            ctx.stroke();
            ctx.restore();
          });
        });
        
        // Draw nodes
        neuralNodes.forEach(node => {
          ctx.save();
          ctx.globalAlpha = node.activity;
          ctx.fillStyle = colorScheme.accent.replace('text-', '#');
          ctx.shadowColor = colorScheme.accent.replace('text-', '#');
          ctx.shadowBlur = 10 * node.pulse;
          
          ctx.beginPath();
          ctx.arc(
            node.x + centerX,
            node.y + centerY,
            5 * node.pulse,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.restore();
        });
      }
      
      if (!settings.paused && !reduce) {
        requestAnimationFrame(render);
      }
    };
    
    render();
  }, [particles, neuralNodes, settings, colorScheme, reduce]);
  
  // Mode-specific content
  const getModeContent = () => {
    const iconClass = `h-8 w-8 ${colorScheme.accent}`;
    
    const contents = {
      showcase: {
        icon: <Sparkles className={iconClass} />,
        title: "AI-Powered Development",
        subtitle: "Next-generation web applications",
        description: "Intelligent, responsive, and beautiful"
      },
      code: {
        icon: <Code className={iconClass} />,
        title: "Live Code Preview",
        subtitle: "Real-time compilation",
        description: "TypeScript • React • Next.js"
      },
      data: {
        icon: <Database className={iconClass} />,
        title: "Data Visualization",
        subtitle: "Interactive analytics",
        description: "Real-time insights and metrics"
      },
      neural: {
        icon: <Cpu className={iconClass} />,
        title: "Neural Network",
        subtitle: "AI processing engine",
        description: "Machine learning algorithms"
      },
      hologram: {
        icon: <Layers className={iconClass} />,
        title: "Holographic Interface",
        subtitle: "3D user experience",
        description: "Immersive interactions"
      },
      matrix: {
        icon: <Globe className={iconClass} />,
        title: "Matrix Protocol",
        subtitle: "Distributed computing",
        description: "Quantum-ready architecture"
      }
    };
    
    return contents[currentMode];
  };
  
  const modeContent = getModeContent();
  
  // Glitch effect
  const glitchStyle = settings.glitch ? {
    animation: 'glitch 2s infinite',
    filter: 'hue-rotate(90deg) saturate(150%)'
  } : {};
  
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Main Preview Container */}
      <motion.div
        ref={containerRef}
        className={`relative overflow-hidden ${TOKENS.radius.xl} ${TOKENS.surfaceGlass} ${colorScheme.glow} backdrop-blur-xl border border-white/10`}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
          ...glitchStyle
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.primary} opacity-10`} />
        
        {/* Hologram effect */}
        {settings.hologram && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 255, 255, 0.03) 2px,
                  rgba(0, 255, 255, 0.03) 4px
                )
              `,
              animation: 'scan 3s linear infinite'
            }}
          />
        )}
        
        {/* Settings Controls */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-black/20 backdrop-blur border border-white/10 hover:bg-black/30 transition-colors"
            aria-label="Toggle settings"
          >
            {showSettings ? <X className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => setSettings(prev => ({ ...prev, paused: !prev.paused }))}
            className="p-2 rounded-lg bg-black/20 backdrop-blur border border-white/10 hover:bg-black/30 transition-colors"
            aria-label={settings.paused ? "Play" : "Pause"}
          >
            {settings.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>
        
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              id={settingsPanelId}
              className="absolute top-16 right-4 z-50 w-80 bg-black/80 backdrop-blur-xl rounded-xl p-4 border border-white/10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-white">Preview Settings</h3>
              
              <div className="space-y-4">
                {/* Mode Selection */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Mode</label>
                  <select
                    value={currentMode}
                    onChange={(e) => setCurrentMode(e.target.value as PreviewMode)}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="showcase">Showcase</option>
                    <option value="code">Code Preview</option>
                    <option value="data">Data Viz</option>
                    <option value="neural">Neural Network</option>
                    <option value="hologram">Hologram</option>
                    <option value="matrix">Matrix</option>
                  </select>
                </div>
                
                {/* Color Scheme */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Color Scheme</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['cyan', 'purple', 'orange', 'rainbow'] as const).map(scheme => (
                      <button
                        key={scheme}
                        onClick={() => setSettings(prev => ({ ...prev, colorScheme: scheme }))}
                        className={`h-8 rounded-lg border-2 ${
                          settings.colorScheme === scheme ? 'border-white' : 'border-transparent'
                        }`}
                        style={{
                          background: scheme === 'rainbow' 
                            ? 'linear-gradient(45deg, #ff0080, #00ff80, #8000ff, #ff8000)'
                            : scheme === 'cyan' ? '#00f5ff'
                            : scheme === 'purple' ? '#a855f7'
                            : '#f97316'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Toggle Options */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'particles', label: 'Particles', icon: Sparkles },
                    { key: 'neural', label: 'Neural Net', icon: Cpu },
                    { key: 'hologram', label: 'Hologram', icon: Layers },
                    { key: 'glitch', label: 'Glitch FX', icon: Zap },
                  ].map(({ key, label, icon: Icon }) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings[key as keyof Settings] as boolean}
                        onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="rounded"
                      />
                      <Icon className="h-4 w-4" />
                      <span className="text-sm text-gray-300">{label}</span>
                    </label>
                  ))}
                </div>
                
                {/* Sliders */}
                {[
                  { key: 'intensity', label: 'Intensity', min: 0.1, max: 2, step: 0.1 },
                  { key: 'speed', label: 'Speed', min: 0.1, max: 3, step: 0.1 },
                  { key: 'depth', label: 'Depth', min: 10, max: 50, step: 1 },
                ].map(({ key, label, min, max, step }) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-300 mb-1">
                      {label}: {(settings[key as keyof Settings] as number).toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={settings[key as keyof Settings] as number}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        [key]: parseFloat(e.target.value) 
                      }))}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 3D Rotating Content */}
        <motion.div
          className="relative h-96 md:h-[480px]"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Particle Canvas */}
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: 'translateZ(20px)' }}
          />
          
          {/* Main Content Panel */}
          <div 
            className="absolute inset-4 rounded-xl bg-gradient-to-br from-black/40 to-black/20 backdrop-blur border border-white/10 flex flex-col items-center justify-center text-center p-8"
            style={{ transform: `translateZ(${settings.depth}px)` }}
          >
            {/* Mode Icon */}
            <motion.div
              className="mb-6"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: settings.autoRotate ? [0, 360] : 0
              }}
              transition={{ 
                scale: { duration: 2, repeat: Infinity },
                rotate: { duration: 20, repeat: Infinity, ease: "linear" }
              }}
            >
              {modeContent.icon}
            </motion.div>
            
            {/* Title */}
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-2"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {modeContent.title}
            </motion.h2>
            
            {/* Subtitle */}
            <motion.p 
              className={`text-lg ${colorScheme.accent} mb-4`}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {modeContent.subtitle}
            </motion.p>
            
            {/* Description */}
            <p className="text-gray-300 text-sm max-w-md">
              {modeContent.description}
            </p>
            
            {/* Status Indicators */}
            <div className="absolute bottom-4 left-4 flex space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">Online</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">Processing</span>
              </div>
            </div>
          </div>
          
          {/* Floating Elements */}
          {Array.from({ length: FLOATING_ELEMENTS }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-4 h-4 ${colorScheme.accent} rounded-full opacity-60`}
              style={{
                left: `${20 + (i % 4) * 20}%`,
                top: `${20 + Math.floor(i / 4) * 25}%`,
                transform: `translateZ(${10 + i * 5}px)`
              }}
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
        
        {/* Performance Stats */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-mono">
          <div>FPS: 60</div>
          <div>Particles: {settings.particles ? PARTICLE_COUNT : 0}</div>
          <div>Mode: {currentMode}</div>
        </div>
      </motion.div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
};

export default HeroPreview;
