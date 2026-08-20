import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.tsx';
import { MusicProvider } from './context/MusicContext.tsx';
import { UnderwaterCanvas3D } from './components/canvas/UnderwaterCanvas3D.tsx';
import { CustomCursor } from './components/common/CustomCursor.tsx';
import { PortalTransition } from './components/common/PortalTransition.tsx';
import { ModeSelector } from './components/common/ModeSelector.tsx';
import { MusicPlayerWidget } from './components/common/MusicPlayerWidget.tsx';
import { EasterEggModal } from './components/common/EasterEggModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { VisitorGateModal } from './components/auth/VisitorGateModal.tsx';
import { Infinity3DWorld } from './components/infinity3d/Infinity3DWorld.tsx';

// Public Components
import { PublicHeader } from './components/public/PublicHeader.tsx';
import { HeroSection } from './components/public/HeroSection.tsx';
import { AboutSection } from './components/public/AboutSection.tsx';
import { EducationSection } from './components/public/EducationSection.tsx';
import { SkillsSection } from './components/public/SkillsSection.tsx';
import { ProjectsSection } from './components/public/ProjectsSection.tsx';
import { ThreeDUniverseSection } from './components/public/ThreeDUniverseSection.tsx';
import { ProjectDetailModal } from './components/public/ProjectDetailModal.tsx';
import { JourneySection } from './components/public/JourneySection.tsx';
import { ContactSection } from './components/public/ContactSection.tsx';
import { PublicFooter } from './components/public/PublicFooter.tsx';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout.tsx';
import { AdminOverview } from './components/admin/AdminOverview.tsx';
import { AdminVisitors } from './components/admin/AdminVisitors.tsx';
import { AdminProfile } from './components/admin/AdminProfile.tsx';
import { AdminUsers } from './components/admin/AdminUsers.tsx';
import { AdminEducation } from './components/admin/AdminEducation.tsx';
import { AdminSkills } from './components/admin/AdminSkills.tsx';
import { AdminProjects } from './components/admin/AdminProjects.tsx';
import { AdminJourney } from './components/admin/AdminJourney.tsx';
import { AdminMusic } from './components/admin/AdminMusic.tsx';
import { AdminStudio2D } from './components/admin/AdminStudio2D.tsx';
import { AdminStudio3D } from './components/admin/AdminStudio3D.tsx';
import { AdminMedia } from './components/admin/AdminMedia.tsx';
import { AdminMessages } from './components/admin/AdminMessages.tsx';
import { AdminSecurity } from './components/admin/AdminSecurity.tsx';
import { AdminPublish } from './components/admin/AdminPublish.tsx';

import { api } from './services/api.ts';
import type { PortfolioData, MusicConfig } from './types.ts';
import { soundFx } from './utils/audio.ts';

const AppContent: React.FC = () => {
  const { isAdmin, admin, openAuthModal } = useAuth();
  const { data, selectedProject, setSelectedProject, isPortalActive, triggerPortal } = useTheme();

  const [currentView, setCurrentViewState] = useState<'public' | 'infinity3d' | 'admin'>(() => {
    try {
      const saved = sessionStorage.getItem('jubin_portfolio_view');
      if (saved === 'admin' || saved === 'infinity3d' || saved === 'public') {
        return saved;
      }
      if (typeof window !== 'undefined' && window.location.hash === '#admin') {
        return 'admin';
      }
    } catch {}
    return 'public';
  });

  const setCurrentView = (view: 'public' | 'infinity3d' | 'admin') => {
    try {
      sessionStorage.setItem('jubin_portfolio_view', view);
    } catch {}
    setCurrentViewState(view);
  };

  const [adminTab, setAdminTab] = useState('overview');
  const [draftData, setDraftData] = useState<PortfolioData | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);

  // Load draft data when admin view opens
  useEffect(() => {
    if ((isAdmin || admin) && currentView === 'admin') {
      api
        .getDraft()
        .then(res => setDraftData(res.draft))
        .catch(err => console.error('Failed to load draft:', err));
    }
  }, [isAdmin, admin, currentView]);

  const handleOpenAdmin = () => {
    soundFx.click();
    if (!isAdmin && !admin) {
      openAuthModal('admin');
    } else {
      setCurrentView('admin');
    }
  };

  const handleEnterInfinityWorld = () => {
    soundFx.portalWarp();
    triggerPortal(() => {
      setCurrentView('infinity3d');
    });
  };

  const handleExitInfinityWorld = () => {
    soundFx.portalWarp();
    triggerPortal(() => {
      setCurrentView('public');
    });
  };

  const handleDraftUpdate = (updated: PortfolioData) => {
    setDraftData(updated);
  };

  const handleMusicDraftUpdate = (updatedMusic: MusicConfig) => {
    if (!draftData) return;
    const updatedDraft: PortfolioData = {
      ...draftData,
      music: updatedMusic
    };
    setDraftData(updatedDraft);
    api.updateDraft({ music: updatedMusic }).catch(err => console.error('Draft audio sync failed:', err));
  };

  const handlePublishSuccess = (published: PortfolioData) => {
    setDraftData(published);
  };

  // Keyboard shortcut listener (~ / ` key opens quantum terminal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-mono">
      {/* Custom Holographic Particle Cursor */}
      <CustomCursor />

      {/* Futuristic Portal Transition Overlay */}
      <PortalTransition isActive={isPortalActive} />

      {/* Persistent Cyber Soundtrack Music Player Widget */}
      <MusicPlayerWidget />

      {/* Terminal / Easter Egg Modal */}
      <EasterEggModal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />

      {/* Compulsory Visitor Registration & Authentication Gate (Firebase Sync) */}
      <VisitorGateModal
        onAdminSuccess={() => {
          setCurrentView('admin');
        }}
      />

      {/* Admin Authentication Passkey Modal */}
      <AuthModal
        onAdminSuccess={() => {
          setCurrentView('admin');
        }}
      />

      {/* Selected Project Dossier Modal */}
      <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />

      {/* VIEW 1: DEDICATED INFINITY 3D WORLD */}
      {currentView === 'infinity3d' && (
        <Infinity3DWorld onExit={handleExitInfinityWorld} />
      )}

      {/* VIEW 2: ADMIN CONTROL CENTER & CMS */}
      {currentView === 'admin' && (isAdmin || !!admin) && (
        <AdminLayout
          activeTab={adminTab}
          setActiveTab={setAdminTab}
          onExitToPublic={() => setCurrentView('public')}
          draftData={draftData}
          setDraftData={setDraftData}
          onPublishSuccess={handlePublishSuccess}
        >
          {adminTab === 'overview' && (
            <AdminOverview draftData={draftData} setActiveTab={setAdminTab} />
          )}
          {adminTab === 'visitors' && <AdminVisitors />}
          {adminTab === 'profile' && (
            <AdminProfile draftData={draftData} onUpdateDraft={handleDraftUpdate} />
          )}
          {adminTab === 'users' && <AdminUsers />}
          {adminTab === 'education' && (
            <AdminEducation draftData={draftData} onUpdateDraft={handleDraftUpdate} />
          )}
          {adminTab === 'skills' && (
            <AdminSkills draftData={draftData} onUpdateDraft={handleDraftUpdate} />
          )}
          {adminTab === 'projects' && (
            <AdminProjects draftData={draftData} onUpdateDraft={handleDraftUpdate} />
          )}
          {adminTab === 'journey' && (
            <AdminJourney draftData={draftData} onUpdateDraft={handleDraftUpdate} />
          )}
          {adminTab === 'music' && (
            <AdminMusic draftData={draftData} onUpdateDraft={handleMusicDraftUpdate} />
          )}
          {adminTab === 'studio2d' && (
            <AdminStudio2D draftData={draftData} onUpdateDraft={handleDraftUpdate} />
          )}
          {adminTab === 'studio3d' && (
            <AdminStudio3D draftData={draftData} onUpdateDraft={handleDraftUpdate} />
          )}
          {adminTab === 'media' && <AdminMedia />}
          {adminTab === 'messages' && <AdminMessages />}
          {adminTab === 'security' && <AdminSecurity />}
          {adminTab === 'publish' && (
            <AdminPublish draftData={draftData} onPublishSuccess={handlePublishSuccess} />
          )}
        </AdminLayout>
      )}

      {/* VIEW 3: MAIN PUBLIC PORTFOLIO EXPERIENCE */}
      {currentView === 'public' && (
        <div className="relative">
          {/* Background 3D Cyber Canvas */}
          <UnderwaterCanvas3D />

          {/* Floating Experience HUD Mode Selector */}
          <ModeSelector onEnterInfinityWorld={handleEnterInfinityWorld} />

          {/* Header Navigation */}
          <PublicHeader
            onOpenTerminal={() => setTerminalOpen(true)}
            onOpenAdmin={handleOpenAdmin}
            onEnterInfinityWorld={handleEnterInfinityWorld}
          />

          {/* Main Public Sections */}
          <main className="relative z-10">
            <HeroSection />
            <AboutSection />
            <EducationSection />
            <SkillsSection />
            <ProjectsSection />
            <ThreeDUniverseSection onEnterInfinityWorld={handleEnterInfinityWorld} />
            <JourneySection />
            <ContactSection />
          </main>

          {/* Public Footer */}
          <PublicFooter />
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MusicProvider>
          <AppContent />
        </MusicProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
