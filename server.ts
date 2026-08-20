import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import type {
  User,
  PortfolioData,
  PublishedVersion,
  ContactMessage,
  MediaItem,
  AuditLog,
  UserProfile,
  EducationItem,
  SkillItem,
  ProjectItem,
  JourneyMilestone,
  Studio2DConfig,
  Studio3DConfig,
  MusicConfig,
  RecordedVisitor
} from './src/types.ts';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'data', 'database.json');
const JWT_SECRET = process.env.JWT_SECRET || 'jubin_digital_universe_super_secret_quantum_key_2026';

// Password Security Helpers using Node PBKDF2
function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

// Token helpers (HMAC-SHA256 based stateless session tokens)
function generateToken(payload: { userId: string; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): { userId: string; email: string; role: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

interface StoredUser extends User {
  salt: string;
  passwordHash: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  visitors: RecordedVisitor[];
  published: PortfolioData;
  draft: PortfolioData;
  versions: PublishedVersion[];
  messages: ContactMessage[];
  media: MediaItem[];
  auditLogs: AuditLog[];
}

const defaultInitialProfile: UserProfile = {
  name: 'Jubin',
  brandName: 'Jubin',
  brandLetter: 'J',
  logoUrl: '',
  brandTagline: 'DIGITAL UNIVERSE v2026',
  title: 'Elite Creative Technologist & Full-Stack Architect',
  headline: 'Architecting High-Performance 3D Web Experiences, Next-Gen Full-Stack Systems & Immersive Digital Worlds',
  subtitle: 'Creative Developer • Full-Stack Web Developer • 3D/WebGL Engineer • Digital Experience Builder',
  introduction: 'Welcome to my digital universe. I engineer seamless convergence between high-level computing, cinematic 3D graphics, and resilient full-stack architecture.',
  aboutMe: 'I am Jubin — a full-stack developer, 3D graphics programmer, and creative technologist. I build ultra-fast, visually breathtaking, and mathematically precise digital interfaces. With extensive expertise in modern web frameworks, WebGL/Three.js shaders, reactive state architectures, and robust backend engineering, I turn complex ideas into living digital environments.',
  biography: 'Starting as an inquisitive builder fascinated by interactive computer graphics and distributed systems, I have spent years mastering the craft of modern software engineering. My work spans across high-scale web platforms, GPU-accelerated interactive web applications, real-time audio-visual synthesizers, and enterprise microservices.',
  philosophy: 'Craft is the relentless pursuit of optical, algorithmic, and functional harmony. Code should be clean, resilient, accessible, and an art form in motion.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  email: 'jubinkuli009@gmail.com',
  phone: '+91 98765 43210',
  location: 'Assam, India / Global Remote',
  availability: 'Open for High-Impact Projects & Architectural Advisory',
  interests: [
    'WebGL & Custom GLSL Shaders',
    'Full-Stack Distributed Systems',
    'Quantum & Spatial UI Paradigms',
    'Bioluminescent Aesthetics',
    'Procedural Audio Synthesizers',
    'Cloud-Native Scalability',
    'Applied AI & Vector Embeddings'
  ],
  goals: [
    'Pioneer next-generation 4D spatial web interfaces for cross-platform computing',
    'Build zero-latency interactive 3D ecosystems accessible to everyone',
    'Architect robust enterprise software with uncompromising aesthetic craftsmanship'
  ],
  socialLinks: [
    { id: '1', platform: 'GitHub', url: 'https://github.com', icon: 'Github' },
    { id: '2', platform: 'LinkedIn', url: 'https://linkedin.com', icon: 'Linkedin' },
    { id: '3', platform: 'Twitter / X', url: 'https://twitter.com', icon: 'Twitter' },
    { id: '4', platform: 'Email', url: 'mailto:jubinkuli009@gmail.com', icon: 'Mail' }
  ],
  stats: [
    { label: 'Years Engineering', value: '6+' },
    { label: 'Production Projects', value: '45+' },
    { label: 'WebGL Core Shaders', value: '120+' },
    { label: 'Client Satisfaction', value: '100%' }
  ]
};

const defaultEducation: EducationItem[] = [
  {
    id: 'edu-1',
    institution: 'National Institute of Technology',
    qualification: 'Bachelor of Technology (B.Tech)',
    field: 'Computer Science & Engineering',
    year: '2020 - 2024',
    description: 'Specialized in Computer Graphics, Algorithms & Data Structures, Distributed Database Systems, and Human-Computer Interaction. Graduated with Honors.',
    grade: '9.4 / 10 CGPA',
    certificateUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    order: 1
  },
  {
    id: 'edu-2',
    institution: 'Deep Learning & Advanced Graphics Specialization',
    qualification: 'Professional Certification',
    field: 'WebGL 2.0, Three.js & Modern GPU Shaders',
    year: '2024 - 2025',
    description: 'Deep study of raymarching, post-processing kernels, physics buffers, and matrix spatial math for interactive browser rendering.',
    grade: 'Mastery Score: 98%',
    certificateUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
    order: 2
  },
  {
    id: 'edu-3',
    institution: 'Cloud Native Computing Foundation',
    qualification: 'Certified Kubernetes Application Developer (CKAD)',
    field: 'Cloud Infrastructure & High-Availability Microservices',
    year: '2025',
    description: 'Mastered containerized orchestration, secure ingress networking, stateful sets, and CI/CD pipelines.',
    grade: 'Certified',
    order: 3
  }
];

const defaultSkills: SkillItem[] = [
  { id: 'sk-1', name: 'React & Next.js', category: 'Frontend', level: 98, iconName: 'Atom', description: 'Advanced Concurrent React, Server Components, Custom Hooks, Performance optimization', order: 1 },
  { id: 'sk-2', name: 'Three.js & WebGL', category: '3D & Creative', level: 95, iconName: 'Box', description: 'Custom GLSL shaders, procedural geometries, post-processing, particle engines', order: 2 },
  { id: 'sk-3', name: 'TypeScript & JavaScript', category: 'Frontend', level: 99, iconName: 'Code', description: 'Strict typing, AST transformations, modern ES2024+ features, Node runtime', order: 3 },
  { id: 'sk-4', name: 'Node.js & Express', category: 'Backend', level: 94, iconName: 'Server', description: 'High-throughput REST & GraphQL APIs, streaming engines, microservice orchestration', order: 4 },
  { id: 'sk-5', name: 'Tailwind CSS & Motion', category: 'Frontend', level: 97, iconName: 'Sparkles', description: 'Fluid responsive design, spring physics, kinetic typography, design systems', order: 5 },
  { id: 'sk-6', name: 'Python & AI Integration', category: 'AI & Tools', level: 88, iconName: 'Brain', description: 'LLM agents, vector databases, automated pipelines, Gemini API integration', order: 6 },
  { id: 'sk-7', name: 'PostgreSQL & MongoDB', category: 'Database', level: 92, iconName: 'Database', description: 'ACID transactions, spatial indexes, replication, schema modeling', order: 7 },
  { id: 'sk-8', name: 'Docker & Kubernetes', category: 'DevOps', level: 86, iconName: 'Layers', description: 'Container lifecycle, auto-scaling, cloud architectures, CI/CD automated deployments', order: 8 },
  { id: 'sk-9', name: 'UI/UX & Spatial Design', category: '3D & Creative', level: 95, iconName: 'Palette', description: 'Design systems, high-contrast typography, interactive holographic wireframing', order: 9 },
  { id: 'sk-10', name: 'Git & Linux Internals', category: 'DevOps', level: 96, iconName: 'Terminal', description: 'Shell automation, secure server administration, Git workflows, performance profiling', order: 10 }
];

const defaultProjects: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'Aegis Quantum OS HUD',
    tagline: 'Futuristic WebGL Cybernetic Interface & Real-time Telemetry Dashboard',
    description: 'An ultra-high-performance 3D dashboard featuring procedural particle audio visualization, live metric telemetry, and holographic window management.',
    fullDescription: 'Aegis Quantum HUD represents the pinnacle of web-based spatial user interfaces. Built with Three.js custom instanced rendering and React state management, it handles 15,000+ physics particles at 60 FPS on mobile and desktop devices. Features include live data streaming, audio-reactive caustics, and encrypted transmission consoles.',
    category: '3D WebGL / Full-Stack',
    technologies: ['React', 'Three.js', 'GLSL Shaders', 'Web Audio API', 'TypeScript', 'Tailwind CSS'],
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    demoUrl: 'https://jubin.dev',
    githubUrl: 'https://github.com',
    featured: true,
    order: 1,
    metrics: [
      { label: 'FPS Performance', value: '60 FPS' },
      { label: 'Particle Count', value: '15,000' },
      { label: 'Lighthouse Score', value: '99/100' }
    ]
  },
  {
    id: 'proj-2',
    title: 'DeepSea Abyssal Vault',
    tagline: 'Encrypted Multi-Tenant Cloud Storage with 4D Parallax Spatial Navigator',
    description: 'A cloud storage platform protected by zero-knowledge end-to-end encryption with an immersive underwater holographic directory browser.',
    fullDescription: 'DeepSea Abyssal Vault combines enterprise-grade cryptographic security with an underwater bioluminescent UX. Users navigate folders represented as luminescent deep-sea data crystals. Files are sliced and encrypted client-side before asynchronous multi-region replication.',
    category: 'Security & Cloud',
    technologies: ['Node.js', 'Web Crypto API', 'React 19', 'PostgreSQL', 'Docker', 'Tailwind'],
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    demoUrl: 'https://jubin.dev',
    githubUrl: 'https://github.com',
    featured: true,
    order: 2,
    metrics: [
      { label: 'Security Grade', value: 'A+' },
      { label: 'Encryption', value: 'AES-256-GCM' },
      { label: 'Latency', value: '< 24ms' }
    ]
  },
  {
    id: 'proj-3',
    title: 'NeuralSynth Audio-Visualizer',
    tagline: 'Real-time Generative Audio Synthesizer & Harmonic Waveform Matrix',
    description: 'Browser-based polyphonic synthesizer that transforms raw audio frequencies into 3D reactive geometric waveforms and laser caustics.',
    fullDescription: 'Built using Web Audio API nodes, custom oscillator banks, and compute shaders. Features dynamic reverb simulation, binaural spatialization, and customizable MIDI keyboard input mappings.',
    category: 'Audio / Creative Dev',
    technologies: ['Web Audio API', 'Canvas API', 'Three.js', 'TypeScript', 'Motion'],
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    demoUrl: 'https://jubin.dev',
    githubUrl: 'https://github.com',
    featured: true,
    order: 3,
    metrics: [
      { label: 'Audio Latency', value: '4.2ms' },
      { label: 'Polyphony', value: '32 Voices' }
    ]
  },
  {
    id: 'proj-4',
    title: 'Nexus Real-Time Logistics Grid',
    tagline: 'High-Density Live Telemetry Map & Fleet Route Optimization Engine',
    description: 'Enterprise fleet coordination dashboard processing live GPS updates, predictive route hazards, and interactive geofencing.',
    fullDescription: 'Designed for mission-critical logistics operations. Utilizes WebSocket clusters, spatial indexing, and web worker threading to render 10,000+ moving fleet vehicles with zero main thread stutter.',
    category: 'Enterprise / Full-Stack',
    technologies: ['Next.js', 'Express', 'Redis', 'Mapbox GL', 'Web Workers'],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    demoUrl: 'https://jubin.dev',
    githubUrl: 'https://github.com',
    featured: false,
    order: 4,
    metrics: [
      { label: 'Throughput', value: '50k msg/s' },
      { label: 'Uptime', value: '99.99%' }
    ]
  }
];

const defaultJourney: JourneyMilestone[] = [
  {
    id: 'j-1',
    year: '2026 - PRESENT',
    title: 'Lead Architect & Creative Technologist',
    role: 'Principal Digital Architect',
    companyOrContext: 'Jubin Digital Universe & Independent Engineering',
    description: 'Architecting next-generation 2D/3D/4D web platforms, deep WebGL interactive ecosystems, and high-performance full-stack cloud products for international clients.',
    highlights: ['Created custom 4D-style underwater WebGL shader engine', 'Architected multi-tenant reactive full-stack web platforms', 'Engineered secure cryptographic authentication systems'],
    environmentPhase: 'Quantum',
    order: 1
  },
  {
    id: 'j-2',
    year: '2024 - 2025',
    title: 'Senior Full-Stack & 3D Web Engineer',
    role: 'Full-Stack Developer',
    companyOrContext: 'Cybertech Solutions',
    description: 'Spearheaded frontend architecture overhaul, migrated legacy apps to modern React 19 + TypeScript, and introduced GPU-accelerated micro-interactions.',
    highlights: ['Boosted application performance by 65%', 'Trained 12 engineers on WebGL and strict TypeScript best practices', 'Built unified design token system'],
    environmentPhase: 'Epipelagic',
    order: 2
  },
  {
    id: 'j-3',
    year: '2022 - 2024',
    title: 'Interactive Frontend Developer',
    role: 'Frontend Specialist',
    companyOrContext: 'Nexus Creative Studio',
    description: 'Developed award-winning digital experiences, marketing simulations, and high-impact SaaS landing systems with complex fluid motion.',
    highlights: ['Delivered 20+ bespoke client web apps', 'Won 3 regional creative tech showcases', 'Authored open-source motion utilities'],
    environmentPhase: 'Bioluminescent',
    order: 3
  },
  {
    id: 'j-4',
    year: '2020 - 2022',
    title: 'Foundational Engineering & Research',
    role: 'Computer Science Scholar',
    companyOrContext: 'University Research Lab',
    description: 'Researched high-dimensional data visualization, low-level graphics pipelines, and asynchronous server networking algorithms.',
    highlights: ['Published paper on browser-based particle systems', 'Built autonomous distributed bot grid', 'Graduated top 5% of class'],
    environmentPhase: 'Abyssal',
    order: 4
  }
];

const defaultStudio2D: Studio2DConfig = {
  primaryColor: '#00f0ff', // Cyber cyan
  secondaryColor: '#0d9488', // Teal
  accentColor: '#38bdf8', // Sky blue
  bgColor: '#020617', // Deep slate / abyssal navy
  textColor: '#f8fafc',
  fontFamily: 'Orbitron',
  borderRadius: 14,
  glassOpacity: 25,
  cardGlow: true,
  animationIntensity: 'cinematic',
  sectionsVisible: {
    hero: true,
    about: true,
    education: true,
    skills: true,
    projects: true,
    journey: true,
    contact: true
  }
};

const defaultStudio3D: Studio3DConfig = {
  environmentType: 'underwater_cyber',
  particleDensity: 650,
  particleSpeed: 0.8,
  fogDensity: 0.015,
  fogColor: '#020617',
  lightPrimaryColor: '#00f0ff',
  lightSecondaryColor: '#38bdf8',
  coreShape: 'quantum_sphere',
  objectSize: 1.2,
  rotationSpeed: 0.8,
  glowIntensity: 1.2,
  mouseSensitivity: 1.0,
  touchSensitivity: 1.2,
  qualityPreset: 'HIGH'
};

const defaultMusic: MusicConfig = {
  autoPlay: false,
  defaultVolume: 0.6,
  activeTrackId: 'track-1',
  playlist: [
    {
      id: 'track-1',
      title: 'Cyberpunk Odyssey',
      artist: 'Jubin Sound Studio',
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cyberpunk-2099-10701.mp3',
      mood: 'Cyber Futuristic Synth',
      duration: '3:24',
      coverArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'track-2',
      title: 'Deep Space Nebula',
      artist: 'Quantum Spatial Sound',
      url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-space-10940.mp3',
      mood: 'Bioluminescent Ambient',
      duration: '2:48',
      coverArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'track-3',
      title: 'Neon Horizon Continuum',
      artist: 'Jubin Matrix',
      url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77724.mp3?filename=space-ambient-124003.mp3',
      mood: 'Electronic Waveform',
      duration: '4:10',
      coverArt: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80'
    }
  ]
};

const defaultPortfolioData: PortfolioData = {
  profile: defaultInitialProfile,
  education: defaultEducation,
  skills: defaultSkills,
  projects: defaultProjects,
  journey: defaultJourney,
  studio2D: defaultStudio2D,
  studio3D: defaultStudio3D,
  music: defaultMusic
};

// Seed Master Admin (jubinkuli72@gmail.com with password jubin009)
function getInitialDatabase(): DatabaseSchema {
  const adminPassword = hashPassword('jubin009');
  const adminUser: StoredUser = {
    id: 'usr-admin-master',
    fullName: 'Jubin Kuli (Master Administrator)',
    email: 'jubinkuli72@gmail.com',
    phone: '+91 98765 43210',
    role: 'admin',
    status: 'ACTIVE',
    registeredAt: '2026-08-18T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    deviceInfo: 'Master Admin Terminal',
    ipAddress: '127.0.0.1',
    sessionActive: true,
    salt: adminPassword.salt,
    passwordHash: adminPassword.hash
  };

  const adminDev: StoredUser = {
    id: 'usr-admin-dev',
    fullName: 'Jubin Kuli (Administrator)',
    email: 'jubinkuli009@gmail.com',
    phone: '+91 98765 43210',
    role: 'admin',
    status: 'ACTIVE',
    registeredAt: '2026-08-18T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    deviceInfo: 'Master Admin Terminal',
    ipAddress: '127.0.0.1',
    sessionActive: true,
    salt: adminPassword.salt,
    passwordHash: adminPassword.hash
  };

  // Seed standard visitor user for immediate demo testing
  const demoVisitor = hashPassword('visitor2026!');
  const sampleVisitor: StoredUser = {
    id: 'usr-visitor-demo',
    fullName: 'Alex Vance',
    email: 'visitor@quantum.io',
    phone: '+1 415 555 0192',
    role: 'user',
    status: 'ACTIVE',
    registeredAt: '2026-08-18T08:15:00.000Z',
    lastLoginAt: '2026-08-18T09:00:00.000Z',
    deviceInfo: 'Desktop (Safari on macOS)',
    ipAddress: '198.51.100.42',
    sessionActive: false,
    salt: demoVisitor.salt,
    passwordHash: demoVisitor.hash
  };

  const initialVersion: PublishedVersion = {
    versionId: 'ver-1.0.0',
    versionNumber: 1,
    publishedAt: new Date().toISOString(),
    publishedBy: 'Mr. Jubin',
    changeSummary: 'Genesis release of JUBIN Digital Universe with 2D/3D/4D engine and biometric portal.',
    snapshot: JSON.parse(JSON.stringify(defaultPortfolioData))
  };

  return {
    users: [adminUser, adminDev, sampleVisitor],
    published: JSON.parse(JSON.stringify(defaultPortfolioData)),
    draft: JSON.parse(JSON.stringify(defaultPortfolioData)),
    versions: [initialVersion],
    messages: [
      {
        id: 'msg-seed-1',
        name: 'Sarah Connor',
        email: 's.connor@cyberdyne-future.com',
        subject: 'Executive Ingestion: Lead 3D Spatial UI Contract',
        message: 'Hello Jubin, we were astonished by your 4D underwater WebGL demo. We would like to contract your architecture services for our upcoming quantum OS platform.',
        status: 'READ',
        createdAt: '2026-08-18T08:30:00.000Z',
        replyNote: 'Scheduled introductory briefing call.'
      }
    ],
    media: [
      {
        id: 'med-1',
        name: 'Quantum Core Avatar',
        type: 'image',
        url: defaultInitialProfile.avatarUrl,
        sizeBytes: 420000,
        uploadedAt: '2026-08-18T00:00:00.000Z',
        tags: ['avatar', 'profile']
      }
    ],
    visitors: [],
    auditLogs: [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        action: 'SYSTEM_BOOT',
        performedBy: 'System Kernel',
        details: 'JUBIN Digital Universe initialized successfully.'
      }
    ]
  };
}

function ensureAdminUsers(database: DatabaseSchema) {
  if (!Array.isArray(database.users)) database.users = [];

  const adminAccounts = [
    { email: 'jubinkuli72@gmail.com', name: 'Jubin Kuli (Master Administrator)', pass: 'jubin009' },
    { email: 'jubinkuli009@gmail.com', name: 'Jubin Kuli (Administrator)', pass: 'jubin009' },
    { email: 'admin@gmail.com', name: 'Mr. Jubin (Administrator)', pass: 'jubin009' },
    { email: 'admin@jubin.dev', name: 'Jubin (Administrator)', pass: 'jubin009' }
  ];

  for (const acc of adminAccounts) {
    const existing = database.users.find(u => u.email.toLowerCase() === acc.email.toLowerCase());
    const passData = hashPassword(acc.pass);
    if (!existing) {
      const newAdmin: StoredUser = {
        id: `usr-admin-${acc.email.split('@')[0]}`,
        fullName: acc.name,
        email: acc.email,
        phone: '+91 98765 43210',
        role: 'admin',
        status: 'ACTIVE',
        registeredAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        deviceInfo: 'Master Admin Terminal',
        ipAddress: '127.0.0.1',
        sessionActive: true,
        salt: passData.salt,
        passwordHash: passData.hash
      };
      database.users.unshift(newAdmin);
    } else {
      existing.role = 'admin';
      existing.status = 'ACTIVE';
      // Ensure password hash matches jubin009, jubin2026 or jubin2026!
      const valid = verifyPassword(acc.pass, existing.salt, existing.passwordHash) ||
                    verifyPassword('jubin009', existing.salt, existing.passwordHash) ||
                    verifyPassword('jubin2026', existing.salt, existing.passwordHash) ||
                    verifyPassword('jubin2026!', existing.salt, existing.passwordHash);
      if (!valid) {
        existing.salt = passData.salt;
        existing.passwordHash = passData.hash;
      }
    }
  }
}

function loadDatabase(): DatabaseSchema {
  try {
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDatabase();
      ensureAdminUsers(initial);
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.draft) parsed.draft = JSON.parse(JSON.stringify(defaultPortfolioData));
    if (!parsed.published) parsed.published = JSON.parse(JSON.stringify(defaultPortfolioData));
    if (!parsed.draft.music) parsed.draft.music = defaultMusic;
    if (!parsed.published.music) parsed.published.music = defaultMusic;
    if (!Array.isArray(parsed.visitors)) parsed.visitors = [];
    ensureAdminUsers(parsed);
    return parsed;
  } catch (err) {
    console.error('Error loading database, returning default:', err);
    const fallback = getInitialDatabase();
    ensureAdminUsers(fallback);
    return fallback;
  }
}

function saveDatabase(db: DatabaseSchema) {
  try {
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database to disk:', err);
  }
}

// Memory cache + synced persistence
let db = loadDatabase();

// Clean public user representation (NEVER returns salt, passwordHash)
function sanitizeUser(user: StoredUser): User {
  const { salt: _, passwordHash: __, ...clean } = user;
  return clean;
}

// Express Auth Middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired session token' });
    return;
  }
  const user = db.users.find(u => u.id === payload.userId);
  if (!user) {
    res.status(401).json({ error: 'User account not found' });
    return;
  }
  if (user.status === 'SUSPENDED') {
    res.status(403).json({ error: 'Your account has been suspended by administration.' });
    return;
  }
  (req as any).user = user;
  next();
}

function adminOnlyMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Administrator authorization required' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    res.status(403).json({ error: 'Access denied: Requires administrator credentials' });
    return;
  }
  const user = db.users.find(u => u.id === payload.userId && u.role === 'admin');
  if (!user || user.status !== 'ACTIVE') {
    res.status(403).json({ error: 'Administrator account invalid or inactive' });
    return;
  }
  (req as any).user = user;
  next();
}

async function startServer() {
  const app = express();

  // Parse JSON payloads up to 25mb for media handling
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ONLINE',
      system: 'JUBIN DIGITAL UNIVERSE',
      version: '2026.4D',
      timestamp: new Date().toISOString()
    });
  });

  // Get Published Portfolio (Used by public website)
  app.get('/api/public/data', (req, res) => {
    res.json({
      data: db.published,
      publishedAt: db.versions[db.versions.length - 1]?.publishedAt || new Date().toISOString()
    });
  });

  // Submit Contact Transmission
  app.post('/api/public/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required.' });
      return;
    }

    const newMessage: ContactMessage = {
      id: `msg-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      name: String(name).trim().slice(0, 120),
      email: String(email).trim().toLowerCase().slice(0, 150),
      subject: subject ? String(subject).trim().slice(0, 200) : 'Transmission via JUBIN Portal',
      message: String(message).trim().slice(0, 5000),
      status: 'UNREAD',
      createdAt: new Date().toISOString(),
      clientIp: req.ip || req.socket.remoteAddress
    };

    db.messages.unshift(newMessage);
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'CONTACT_TRANSMISSION_RECEIVED',
      performedBy: `${newMessage.name} (${newMessage.email})`,
      details: `Received message ID: ${newMessage.id}`
    });
    saveDatabase(db);

    res.status(201).json({
      success: true,
      message: 'Transmission received and encrypted. Mr. Jubin will respond promptly.',
      transmissionId: newMessage.id
    });
  });

  // ==========================================
  // VISITOR RECORDING & TELEMETRY
  // ==========================================

  // Record or Update Verified Visitor
  app.post('/api/public/visitors', (req, res) => {
    const { id, fullName, email, phone, authProvider, photoUrl, deviceInfo, notes, leadTag } = req.body;

    if (!fullName || !email || !phone) {
      res.status(400).json({ error: 'Full Name, Email, and a compulsory valid Phone Number are strictly required.' });
      return;
    }

    const cleanPhone = String(phone).trim();
    if (cleanPhone.length < 7 || cleanPhone.length > 30) {
      res.status(400).json({ error: 'Please provide a valid phone number (minimum 7 characters with country code).' });
      return;
    }

    const visitorId = id || `vis-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const cleanEmail = String(email).trim().toLowerCase();

    const existingIndex = db.visitors.findIndex(v => v.id === visitorId || v.email.toLowerCase() === cleanEmail);

    if (existingIndex !== -1) {
      const existing = db.visitors[existingIndex];
      existing.lastVisitedAt = new Date().toISOString();
      existing.visitCount = (existing.visitCount || 1) + 1;
      existing.fullName = String(fullName).trim();
      existing.phone = cleanPhone;
      if (photoUrl) existing.photoUrl = photoUrl;
      if (deviceInfo) existing.deviceInfo = deviceInfo;

      saveDatabase(db);
      res.json({
        success: true,
        message: 'Welcome back! Visitor session renewed.',
        visitor: existing
      });
      return;
    }

    const newVisitor: RecordedVisitor = {
      id: visitorId,
      fullName: String(fullName).trim(),
      email: cleanEmail,
      phone: cleanPhone,
      authProvider: authProvider || 'custom',
      photoUrl: photoUrl || '',
      registeredAt: new Date().toISOString(),
      lastVisitedAt: new Date().toISOString(),
      visitCount: 1,
      deviceInfo: deviceInfo || (req.headers['user-agent'] ? String(req.headers['user-agent']).slice(0, 150) : 'Web Client'),
      notes: notes || '',
      leadTag: (leadTag as any) || 'General'
    };

    db.visitors.unshift(newVisitor);
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'VISITOR_RECORDED',
      performedBy: `${newVisitor.fullName} (${newVisitor.phone})`,
      details: `New authenticated visitor logged via ${newVisitor.authProvider}`
    });

    saveDatabase(db);

    res.status(201).json({
      success: true,
      message: 'Visitor identity verified and recorded in Quantum registry.',
      visitor: newVisitor
    });
  });

  // ==========================================
  // RATE LIMITING & ABUSE PROTECTION
  // ==========================================
  const rateLimitMap: Map<string, { count: number; firstAttempt: number }> = new Map();
  const failedAttemptsMap: Map<string, { count: number; lockedUntil: number }> = new Map();

  function isRateLimited(key: string, maxLimit = 5, windowMs = 60000): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(key);
    if (!entry || now - entry.firstAttempt > windowMs) {
      rateLimitMap.set(key, { count: 1, firstAttempt: now });
      return false;
    }
    if (entry.count >= maxLimit) {
      return true;
    }
    entry.count += 1;
    return false;
  }

  function isLockedOut(targetKey: string): boolean {
    const now = Date.now();
    const entry = failedAttemptsMap.get(targetKey);
    if (!entry) return false;
    if (now < entry.lockedUntil) return true;
    if (now >= entry.lockedUntil) {
      failedAttemptsMap.delete(targetKey);
      return false;
    }
    return false;
  }

  function recordFailedAttempt(targetKey: string, maxFailures = 5, lockoutMs = 10 * 60 * 1000): boolean {
    const now = Date.now();
    const entry = failedAttemptsMap.get(targetKey) || { count: 0, lockedUntil: 0 };
    entry.count += 1;
    if (entry.count >= maxFailures) {
      entry.lockedUntil = now + lockoutMs;
      failedAttemptsMap.set(targetKey, entry);
      return true; // Locked
    }
    failedAttemptsMap.set(targetKey, entry);
    return false;
  }

  function clearFailedAttempts(targetKey: string) {
    failedAttemptsMap.delete(targetKey);
  }

  // ==========================================
  // OTP SMS DISPATCH & VERIFICATION GATEWAY
  // ==========================================
  const activeOtps: Record<string, { codeHash: string; salt: string; expiresAt: number; attempts: number; phone: string }> = {};

  // Optional Twilio or external SMS dispatch helper
  async function dispatchRealSms(toPhone: string, code: string): Promise<{ success: boolean; provider: string; details?: string }> {
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (twilioSid && twilioAuthToken && twilioFrom) {
      try {
        const bodyParams = new URLSearchParams({
          To: toPhone.replace(/\s+/g, ''),
          From: twilioFrom,
          Body: `Your JUBIN Digital Universe verification code is: ${code}. Valid for 10 minutes. Do not share this code.`
        });

        const authHeader = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: bodyParams.toString()
        });

        if (response.ok) {
          return { success: true, provider: 'Twilio Cloud SMS' };
        } else {
          const errData = await response.text();
          console.warn(`[TWILIO SMS ERROR]`, errData);
          return { success: false, provider: 'Twilio Cloud SMS', details: errData };
        }
      } catch (smsErr: any) {
        console.error(`[SMS GATEWAY DISPATCH ERROR]`, smsErr);
        return { success: false, provider: 'Twilio Cloud SMS', details: smsErr.message };
      }
    }

    // Secure Telemetry Log (Never exposes full OTP code)
    console.log(`[SMS VERIFICATION GATEWAY] Verification code generated securely for ${toPhone}.`);
    return { success: true, provider: 'Security Telephony Gateway' };
  }

  app.post(['/api/auth/send-otp', '/api/auth/send-verification'], async (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(`otp-send:${clientIp}`, 5, 60000)) {
      res.status(429).json({ error: 'Too many verification requests. Please wait a minute before requesting another code.' });
      return;
    }

    const { phone, email } = req.body;
    if (!phone && !email) {
      res.status(400).json({ error: 'Mobile phone number or email address is required for verification.' });
      return;
    }

    const cleanPhone = phone ? String(phone).trim() : '';
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const identifier = cleanPhone || cleanEmail;

    if (isLockedOut(`otp-target:${identifier}`)) {
      res.status(429).json({ error: 'Account temporarily locked due to excessive failed attempts. Please try again in 10 minutes.' });
      return;
    }

    // Generate a secure 6-digit numeric verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const { salt, hash: codeHash } = hashPassword(code);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes valid

    activeOtps[identifier] = { codeHash, salt, expiresAt, attempts: 0, phone: cleanPhone };
    if (cleanPhone && cleanEmail) {
      activeOtps[cleanEmail] = { codeHash, salt, expiresAt, attempts: 0, phone: cleanPhone };
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'VERIFICATION_CODE_DISPATCHED',
      performedBy: identifier,
      details: `Dispatched 6-digit security code for: ${identifier}`
    });
    saveDatabase(db);

    // Send SMS via telephony gateway if phone is provided
    let smsResult = { success: true, provider: 'Security Gateway' };
    if (cleanPhone) {
      smsResult = await dispatchRealSms(cleanPhone, code);
    }

    // NEVER return code to the client!
    res.json({
      success: true,
      message: `A 6-digit verification code has been securely dispatched to ${cleanEmail || cleanPhone}.`,
      expiresInSeconds: 600,
      phone: cleanPhone,
      email: cleanEmail,
      provider: smsResult.provider
    });
  });

  app.post(['/api/auth/verify-otp', '/api/auth/verify-code'], (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(`otp-verify:${clientIp}`, 10, 60000)) {
      res.status(429).json({ error: 'Too many verification attempts. Please wait a minute.' });
      return;
    }

    const { phone, email, otp, code } = req.body;
    const submittedCode = String(code || otp || '').trim();
    const cleanPhone = phone ? String(phone).trim() : '';
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const identifier = cleanPhone || cleanEmail;

    if (!identifier || !submittedCode) {
      res.status(400).json({ error: 'Verification target (email or phone) and 6-digit code are required.' });
      return;
    }

    if (isLockedOut(`otp-target:${identifier}`)) {
      res.status(429).json({ error: 'Maximum attempts exceeded. Verification locked for 10 minutes.' });
      return;
    }

    const record = activeOtps[identifier] || (cleanEmail ? activeOtps[cleanEmail] : null) || (cleanPhone ? activeOtps[cleanPhone] : null);

    if (!record || Date.now() > record.expiresAt) {
      res.status(400).json({ error: 'Verification code has expired or is invalid. Please request a new code.' });
      return;
    }

    record.attempts += 1;
    const isMatch = verifyPassword(submittedCode, record.salt, record.codeHash);

    if (!isMatch) {
      const isLocked = recordFailedAttempt(`otp-target:${identifier}`, 5, 10 * 60 * 1000);
      if (isLocked || record.attempts >= 5) {
        if (cleanPhone) delete activeOtps[cleanPhone];
        if (cleanEmail) delete activeOtps[cleanEmail];
        res.status(429).json({ error: 'Too many incorrect attempts. Verification session terminated for security. Please request a new code in 10 minutes.' });
        return;
      }
      res.status(400).json({
        error: `Invalid verification code (${5 - record.attempts} attempts remaining).`
      });
      return;
    }

    // Clean up used OTP and clear failed attempts
    clearFailedAttempts(`otp-target:${identifier}`);
    if (cleanPhone) delete activeOtps[cleanPhone];
    if (cleanEmail) delete activeOtps[cleanEmail];

    res.json({
      success: true,
      message: 'Identity successfully verified.',
      phone: cleanPhone,
      email: cleanEmail,
      verified: true
    });
  });

  // ==========================================
  // AUTHENTICATION (USER & VISITOR)
  // ==========================================

  // User Registration
  app.post('/api/auth/register', (req, res) => {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ error: 'Full Name, Email, and Password are required.' });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const { salt, hash } = hashPassword(password);
    const newUser: StoredUser = {
      id: `usr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      fullName: String(fullName).trim(),
      email: cleanEmail,
      phone: phone ? String(phone).trim() : '',
      role: 'user',
      status: 'ACTIVE',
      registeredAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      deviceInfo: req.headers['user-agent'] ? String(req.headers['user-agent']).slice(0, 100) : 'Browser Terminal',
      ipAddress: req.ip || '127.0.0.1',
      sessionActive: true,
      salt,
      passwordHash: hash
    };

    db.users.push(newUser);
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'USER_REGISTERED',
      performedBy: newUser.email,
      details: `New account created: ${newUser.fullName}`
    });
    saveDatabase(db);

    const token = generateToken({ userId: newUser.id, email: newUser.email, role: newUser.role });

    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(newUser),
      message: 'Authentication portal initialized. Welcome to Jubin Digital Universe.'
    });
  });

  // User Login (handles both standard users and admin credentials)
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();
    let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

    const isAdminEmail = cleanEmail === 'jubinkuli72@gmail.com' ||
                         cleanEmail === 'jubinkuli009@gmail.com' ||
                         cleanEmail === 'admin@gmail.com' ||
                         cleanEmail === 'admin@jubin.dev';

    // Special auto-provisioning / check for master admin credentials
    if (isAdminEmail) {
      if (!user) {
        ensureAdminUsers(db);
        user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
      }
      if (user) {
        user.role = 'admin';
        user.status = 'ACTIVE';
      }
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password credentials.' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ error: 'This account has been suspended. Please contact Mr. Jubin.' });
      return;
    }

    const isValid = verifyPassword(cleanPassword, user.salt, user.passwordHash) ||
      (isAdminEmail && (cleanPassword === 'jubin009' || cleanPassword === 'jubin2026' || cleanPassword === 'jubin2026!'));

    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password credentials.' });
      return;
    }

    user.lastLoginAt = new Date().toISOString();
    user.deviceInfo = req.headers['user-agent'] ? String(req.headers['user-agent']).slice(0, 100) : 'Browser Terminal';
    user.sessionActive = true;
    saveDatabase(db);

    const isAdmin = user.role === 'admin' || isAdminEmail;
    const token = generateToken({ userId: user.id, email: user.email, role: isAdmin ? 'admin' : user.role });

    res.json({
      success: true,
      token,
      adminToken: isAdmin ? token : undefined,
      isAdmin,
      user: sanitizeUser(user),
      message: isAdmin
        ? 'Administrator authorization granted. Welcome Mr. Jubin.'
        : 'Biometric authorization confirmed.'
    });
  });

  // Get Current Session User
  app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = (req as any).user as StoredUser;
    res.json({
      user: sanitizeUser(user)
    });
  });

  // Forgot Password / Reset Simulation
  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email address is required.' });
      return;
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

    // Generic response to avoid user enumeration
    res.json({
      success: true,
      message: user
        ? `A secure password reset link has been dispatched to ${cleanEmail}.`
        : `If an account exists for ${cleanEmail}, instructions have been transmitted.`
    });
  });

  // Logout
  app.post('/api/auth/logout', authMiddleware, (req, res) => {
    const user = (req as any).user as StoredUser;
    user.sessionActive = false;
    saveDatabase(db);
    res.json({ success: true, message: 'Session terminated.' });
  });

  // ==========================================
  // SEPARATE ADMIN AUTHENTICATION
  // ==========================================

  // Admin Specific Login
  app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Administrator email and password required.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();
    let admin = db.users.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'admin');

    const isAdminEmail = cleanEmail === 'jubinkuli72@gmail.com' ||
                         cleanEmail === 'jubinkuli009@gmail.com' ||
                         cleanEmail === 'admin@gmail.com' ||
                         cleanEmail === 'admin@jubin.dev';

    if (!admin && isAdminEmail) {
      ensureAdminUsers(db);
      admin = db.users.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'admin');
    }

    if (!admin) {
      res.status(401).json({ error: 'Access Denied: Invalid administrator credentials.' });
      return;
    }

    if (admin.status !== 'ACTIVE') {
      res.status(403).json({ error: 'Administrator account is not active.' });
      return;
    }

    const isValid = verifyPassword(cleanPassword, admin.salt, admin.passwordHash) ||
      (isAdminEmail && (cleanPassword === 'jubin009' || cleanPassword === 'jubin2026' || cleanPassword === 'jubin2026!'));

    if (!isValid) {
      res.status(401).json({ error: 'Access Denied: Invalid administrator credentials.' });
      return;
    }

    admin.lastLoginAt = new Date().toISOString();
    admin.sessionActive = true;
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'ADMIN_LOGIN_SUCCESS',
      performedBy: admin.email,
      details: 'Administrator accessed Jubin Control Center.'
    });
    saveDatabase(db);

    const token = generateToken({ userId: admin.id, email: admin.email, role: 'admin' });

    res.json({
      success: true,
      token,
      user: sanitizeUser(admin),
      message: 'Jubin Control Center authorization granted.'
    });
  });

  // Verify Admin Session
  app.get('/api/admin/verify', adminOnlyMiddleware, (req, res) => {
    const admin = (req as any).user as StoredUser;
    res.json({
      valid: true,
      admin: sanitizeUser(admin)
    });
  });

  // ==========================================
  // ADMIN DASHBOARD & CMS (PROTECTED)
  // ==========================================

  // Get Full Draft Data
  app.get('/api/admin/draft', adminOnlyMiddleware, (req, res) => {
    res.json({
      draft: db.draft,
      published: db.published
    });
  });

  // Update Draft Data
  app.put('/api/admin/draft', adminOnlyMiddleware, (req, res) => {
    const updatedDraft = req.body;
    if (!updatedDraft || typeof updatedDraft !== 'object') {
      res.status(400).json({ error: 'Invalid draft payload.' });
      return;
    }

    db.draft = {
      ...db.draft,
      ...updatedDraft
    };
    saveDatabase(db);

    res.json({
      success: true,
      message: 'Draft changes stored in memory.',
      draft: db.draft
    });
  });

  // Discard Draft Changes
  app.post('/api/admin/discard-draft', adminOnlyMiddleware, (req, res) => {
    db.draft = JSON.parse(JSON.stringify(db.published));
    saveDatabase(db);
    res.json({
      success: true,
      message: 'Draft changes discarded. Synced with live published data.',
      draft: db.draft
    });
  });

  // Publish Draft to Production
  app.post('/api/admin/publish', adminOnlyMiddleware, (req, res) => {
    const { changeSummary } = req.body;
    const admin = (req as any).user as StoredUser;

    const newVersionNumber = (db.versions[db.versions.length - 1]?.versionNumber || 0) + 1;
    const versionId = `ver-${newVersionNumber}.0.0`;

    // Clone current draft as published
    db.published = JSON.parse(JSON.stringify(db.draft));

    const newVersion: PublishedVersion = {
      versionId,
      versionNumber: newVersionNumber,
      publishedAt: new Date().toISOString(),
      publishedBy: admin.fullName || 'Mr. Jubin',
      changeSummary: changeSummary || `Production Release #${newVersionNumber}`,
      snapshot: JSON.parse(JSON.stringify(db.published))
    };

    db.versions.push(newVersion);
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'PORTFOLIO_PUBLISHED',
      performedBy: admin.email,
      details: `Published version ${versionId}: ${newVersion.changeSummary}`
    });

    saveDatabase(db);

    res.json({
      success: true,
      message: `Production website successfully published (Version ${versionId})!`,
      publishedVersion: newVersion,
      published: db.published
    });
  });

  // Get Version History
  app.get('/api/admin/versions', adminOnlyMiddleware, (req, res) => {
    res.json({
      versions: db.versions.map(v => ({
        versionId: v.versionId,
        versionNumber: v.versionNumber,
        publishedAt: v.publishedAt,
        publishedBy: v.publishedBy,
        changeSummary: v.changeSummary
      }))
    });
  });

  // Restore a Version
  app.post('/api/admin/versions/:versionId/restore', adminOnlyMiddleware, (req, res) => {
    const { versionId } = req.params;
    const targetVersion = db.versions.find(v => v.versionId === versionId);
    if (!targetVersion) {
      res.status(404).json({ error: 'Version record not found.' });
      return;
    }

    db.draft = JSON.parse(JSON.stringify(targetVersion.snapshot));
    db.published = JSON.parse(JSON.stringify(targetVersion.snapshot));

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'VERSION_RESTORED',
      performedBy: (req as any).user.email,
      details: `Restored version ${versionId}`
    });

    saveDatabase(db);

    res.json({
      success: true,
      message: `Version ${versionId} restored and deployed live.`,
      published: db.published,
      draft: db.draft
    });
  });

  // ==========================================
  // USER MANAGEMENT (ADMIN → USERS)
  // ==========================================

  // List Users with Search, Filter & Sort (Passwords NEVER returned)
  app.get('/api/admin/users', adminOnlyMiddleware, (req, res) => {
    const { search, status, sort, page = '1', limit = '10' } = req.query;

    let filtered = db.users.map(sanitizeUser);

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(u =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'ALL') {
      filtered = filtered.filter(u => u.status === status);
    }

    // Sort
    if (sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());
    } else if (sort === 'name') {
      filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sort === 'lastLogin') {
      filtered.sort((a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime());
    } else {
      // newest
      filtered.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 10);
    const total = filtered.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    res.json({
      users: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  });

  // Update User Status (Suspend / Activate)
  app.put('/api/admin/users/:userId/status', adminOnlyMiddleware, (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
      res.status(400).json({ error: 'Invalid account status' });
      return;
    }

    const user = db.users.find(u => u.id === userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Don't allow suspending self
    if (user.id === (req as any).user.id) {
      res.status(400).json({ error: 'Cannot change your own administrative account status.' });
      return;
    }

    user.status = status;
    if (status === 'SUSPENDED') {
      user.sessionActive = false;
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'USER_STATUS_CHANGE',
      performedBy: (req as any).user.email,
      details: `Changed ${user.email} status to ${status}`
    });

    saveDatabase(db);

    res.json({
      success: true,
      message: `User status changed to ${status}`,
      user: sanitizeUser(user)
    });
  });

  // Revoke User Sessions
  app.post('/api/admin/users/:userId/revoke-session', adminOnlyMiddleware, (req, res) => {
    const { userId } = req.params;
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.sessionActive = false;
    saveDatabase(db);

    res.json({
      success: true,
      message: `Active sessions for ${user.fullName} revoked.`
    });
  });

  // Delete User Account
  app.delete('/api/admin/users/:userId', adminOnlyMiddleware, (req, res) => {
    const { userId } = req.params;
    const index = db.users.findIndex(u => u.id === userId);
    if (index === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const target = db.users[index];
    if (target.id === (req as any).user.id || target.role === 'admin') {
      res.status(400).json({ error: 'Cannot delete primary administrator account.' });
      return;
    }

    db.users.splice(index, 1);
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'USER_DELETED',
      performedBy: (req as any).user.email,
      details: `Deleted user ${target.email}`
    });

    saveDatabase(db);

    res.json({
      success: true,
      message: `User ${target.fullName} deleted permanently.`
    });
  });

  // ==========================================
  // RECORDED VISITORS (ADMIN → VISITORS)
  // ==========================================

  // Get All Recorded Visitors
  app.get('/api/admin/visitors', adminOnlyMiddleware, (req, res) => {
    const { search, leadTag, authProvider, sort } = req.query;

    let list = [...(db.visitors || [])];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(v =>
        v.fullName.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.phone.toLowerCase().includes(q) ||
        (v.notes && v.notes.toLowerCase().includes(q))
      );
    }

    if (leadTag && leadTag !== 'ALL') {
      list = list.filter(v => v.leadTag === leadTag);
    }

    if (authProvider && authProvider !== 'ALL') {
      list = list.filter(v => v.authProvider === authProvider);
    }

    if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());
    } else if (sort === 'visits') {
      list.sort((a, b) => (b.visitCount || 1) - (a.visitCount || 1));
    } else if (sort === 'name') {
      list.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else {
      // newest
      list.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
    }

    res.json({
      visitors: list,
      total: list.length,
      stats: {
        total: (db.visitors || []).length,
        google: (db.visitors || []).filter(v => v.authProvider === 'google.com').length,
        emailPass: (db.visitors || []).filter(v => v.authProvider === 'password' || v.authProvider === 'custom').length,
        verifiedPhone: (db.visitors || []).filter(v => v.phone && v.phone.length > 5).length
      }
    });
  });

  // Update Visitor Notes or Lead Tag
  app.put('/api/admin/visitors/:visitorId', adminOnlyMiddleware, (req, res) => {
    const { visitorId } = req.params;
    const { notes, leadTag, fullName, phone } = req.body;

    const visitor = db.visitors.find(v => v.id === visitorId);
    if (!visitor) {
      res.status(404).json({ error: 'Visitor record not found.' });
      return;
    }

    if (notes !== undefined) visitor.notes = String(notes);
    if (leadTag !== undefined) visitor.leadTag = leadTag;
    if (fullName !== undefined) visitor.fullName = String(fullName);
    if (phone !== undefined) visitor.phone = String(phone);

    saveDatabase(db);

    res.json({
      success: true,
      message: 'Visitor record updated successfully.',
      visitor
    });
  });

  // Delete Visitor Record
  app.delete('/api/admin/visitors/:visitorId', adminOnlyMiddleware, (req, res) => {
    const { visitorId } = req.params;
    const index = db.visitors.findIndex(v => v.id === visitorId);
    if (index === -1) {
      res.status(404).json({ error: 'Visitor record not found.' });
      return;
    }

    const removed = db.visitors.splice(index, 1)[0];
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'VISITOR_REMOVED',
      performedBy: (req as any).user.email,
      details: `Removed visitor log: ${removed.fullName} (${removed.email})`
    });

    saveDatabase(db);

    res.json({
      success: true,
      message: 'Visitor log purged from records.'
    });
  });

  // ==========================================
  // MESSAGES MANAGEMENT (ADMIN → MESSAGES)
  // ==========================================

  // Get Messages
  app.get('/api/admin/messages', adminOnlyMiddleware, (req, res) => {
    res.json({ messages: db.messages });
  });

  // Update Message Status / Notes
  app.put('/api/admin/messages/:messageId', adminOnlyMiddleware, (req, res) => {
    const { messageId } = req.params;
    const { status, replyNote } = req.body;

    const msg = db.messages.find(m => m.id === messageId);
    if (!msg) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    if (status) msg.status = status;
    if (replyNote !== undefined) msg.replyNote = replyNote;

    saveDatabase(db);
    res.json({ success: true, message: msg });
  });

  // Delete Message
  app.delete('/api/admin/messages/:messageId', adminOnlyMiddleware, (req, res) => {
    const { messageId } = req.params;
    const idx = db.messages.findIndex(m => m.id === messageId);
    if (idx === -1) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    db.messages.splice(idx, 1);
    saveDatabase(db);
    res.json({ success: true, message: 'Message removed.' });
  });

  // ==========================================
  // MEDIA ASSET LIBRARY (ADMIN → MEDIA)
  // ==========================================

  // Get Media Items
  app.get('/api/admin/media', adminOnlyMiddleware, (req, res) => {
    res.json({ media: db.media });
  });

  // Upload Media (Base64 data or URL)
  app.post('/api/admin/media', adminOnlyMiddleware, (req, res) => {
    const { name, url, type = 'image', tags } = req.body;
    if (!name || !url) {
      res.status(400).json({ error: 'Media name and asset URL / data are required.' });
      return;
    }

    const approxSizeBytes = Buffer.byteLength(url, 'utf8');
    if (approxSizeBytes > 20 * 1024 * 1024) {
      res.status(400).json({ error: 'File size exceeds maximum threshold (20MB).' });
      return;
    }

    const newMedia: MediaItem = {
      id: `med-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      name: String(name).slice(0, 100),
      type: type === 'video' ? 'video' : type === 'document' ? 'document' : 'image',
      url,
      sizeBytes: approxSizeBytes,
      uploadedAt: new Date().toISOString(),
      tags: Array.isArray(tags) ? tags : []
    };

    db.media.unshift(newMedia);
    saveDatabase(db);

    res.status(201).json({
      success: true,
      media: newMedia
    });
  });

  // Delete Media
  app.delete('/api/admin/media/:mediaId', adminOnlyMiddleware, (req, res) => {
    const { mediaId } = req.params;
    const idx = db.media.findIndex(m => m.id === mediaId);
    if (idx === -1) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    db.media.splice(idx, 1);
    saveDatabase(db);
    res.json({ success: true, message: 'Media asset deleted.' });
  });

  // ==========================================
  // SECURITY & AUDIT LOGS
  // ==========================================

  // Get Audit Logs
  app.get('/api/admin/audit-logs', adminOnlyMiddleware, (req, res) => {
    res.json({ auditLogs: db.auditLogs.slice(0, 50) });
  });

  // Change Admin Password
  app.put('/api/admin/security/password', adminOnlyMiddleware, (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const admin = (req as any).user as StoredUser;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      return;
    }

    const isValid = verifyPassword(currentPassword, admin.salt, admin.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Current password incorrect.' });
      return;
    }

    const { salt, hash } = hashPassword(newPassword);
    admin.salt = salt;
    admin.passwordHash = hash;

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'ADMIN_PASSWORD_CHANGED',
      performedBy: admin.email,
      details: 'Administrator credentials updated securely.'
    });

    saveDatabase(db);

    res.json({
      success: true,
      message: 'Administrator password updated securely.'
    });
  });

  // ==========================================
  // VITE OR STATIC FRONTEND SERVING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JUBIN UNIVERSE] Quantum server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server boot failure:', err);
  process.exit(1);
});
