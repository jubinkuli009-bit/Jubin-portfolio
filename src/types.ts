export type UserRole = 'user' | 'admin';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  registeredAt: string;
  lastLoginAt: string;
  deviceInfo?: string;
  ipAddress?: string;
  sessionActive?: boolean;
}

export interface EducationItem {
  id: string;
  institution: string;
  qualification: string;
  field: string;
  year: string;
  description: string;
  grade?: string;
  certificateUrl?: string;
  order: number;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | '3D & Creative' | 'Database' | 'DevOps' | 'AI & Tools';
  level: number; // 0 - 100
  iconName: string;
  description: string;
  order: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  fullDescription: string;
  category: string;
  technologies: string[];
  imageUrl: string;
  videoUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  metrics?: { label: string; value: string }[];
}

export interface JourneyMilestone {
  id: string;
  year: string;
  title: string;
  role: string;
  companyOrContext: string;
  description: string;
  highlights: string[];
  environmentPhase: 'Abyssal' | 'Bioluminescent' | 'Mesopelagic' | 'Epipelagic' | 'Quantum';
  order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  brandName?: string;
  brandLetter?: string;
  logoUrl?: string;
  brandTagline?: string;
  title: string;
  headline: string;
  subtitle: string;
  introduction: string;
  aboutMe: string;
  biography: string;
  philosophy: string;
  avatarUrl: string;
  email: string;
  phone: string;
  location: string;
  availability: string;
  interests: string[];
  goals: string[];
  socialLinks: SocialLink[];
  stats: { label: string; value: string; suffix?: string }[];
}

export interface SongTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  mood?: string;
  duration?: string;
  coverArt?: string;
}

export interface MusicConfig {
  autoPlay: boolean;
  defaultVolume: number; // 0.0 to 1.0
  activeTrackId: string;
  playlist: SongTrack[];
}

export interface Studio2DConfig {
  primaryColor: string; // hex
  secondaryColor: string; // hex
  accentColor: string; // hex
  bgColor: string; // hex
  textColor: string; // hex
  fontFamily: 'Orbitron' | 'Inter' | 'Plus Jakarta Sans' | 'Syne' | 'Space Grotesk';
  borderRadius: number; // px (0 - 24)
  glassOpacity: number; // 0 - 100
  cardGlow: boolean;
  animationIntensity: 'subtle' | 'normal' | 'cinematic';
  sectionsVisible: {
    hero: boolean;
    about: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    journey: boolean;
    contact: boolean;
  };
}

export interface Studio3DConfig {
  environmentType: 'underwater_cyber' | 'deep_ocean_quantum' | 'cosmic_abyss';
  particleDensity: number; // 50 - 2000
  particleSpeed: number; // 0.1 - 3.0
  fogDensity: number; // 0.001 - 0.05
  fogColor: string;
  lightPrimaryColor: string;
  lightSecondaryColor: string;
  coreShape: 'quantum_sphere' | 'hyper_crystal' | 'cyber_torus' | 'abyssal_ring';
  objectSize: number; // 0.5 - 2.5
  rotationSpeed: number; // 0.1 - 4.0
  glowIntensity: number; // 0.1 - 2.0
  mouseSensitivity: number;
  touchSensitivity: number;
  qualityPreset: 'LOW' | 'BALANCED' | 'HIGH' | 'ULTRA';
}

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  sizeBytes: number;
  uploadedAt: string;
  tags?: string[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
  replyNote?: string;
  clientIp?: string;
}

export interface PublishedVersion {
  versionId: string;
  versionNumber: number;
  publishedAt: string;
  publishedBy: string;
  changeSummary: string;
  snapshot: PortfolioData;
}

export interface PortfolioData {
  profile: UserProfile;
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  journey: JourneyMilestone[];
  studio2D: Studio2DConfig;
  studio3D: Studio3DConfig;
  music: MusicConfig;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface RecordedVisitor {
  id: string; // Firebase UID or unique visitor ID
  fullName: string;
  email: string;
  phone: string; // Compulsory valid phone number
  authProvider: 'password' | 'email' | 'phone' | 'custom' | 'google.com';
  photoUrl?: string;
  country?: string;
  city?: string;
  registeredAt: string;
  lastVisitedAt: string;
  visitCount: number;
  deviceInfo?: string;
  notes?: string;
  leadTag?: 'Lead' | 'Recruiter' | 'Client' | 'General' | 'VIP' | 'Administrator';
}

export type ExperienceMode = '2D' | '3D' | '4D' | 'AUTO' | 'INFINITY_3D';
