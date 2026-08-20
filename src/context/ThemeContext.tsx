import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { PortfolioData, ProjectItem, ExperienceMode } from '../types.ts';
import { api } from '../services/api.ts';
import { soundFx } from '../utils/audio.ts';

interface ThemeContextType {
  data: PortfolioData | null;
  loading: boolean;
  error: string | null;
  experienceMode: ExperienceMode;
  effectiveMode: '2D' | '3D' | '4D';
  setExperienceMode: (mode: ExperienceMode) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (val: boolean) => void;
  selectedProject: ProjectItem | null;
  setSelectedProject: (proj: ProjectItem | null) => void;
  isPortalActive: boolean;
  triggerPortal: (callback?: () => void) => void;
  refreshPortfolio: () => Promise<void>;
  updateLiveDraftData: (updated: PortfolioData) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [experienceMode, setExperienceModeState] = useState<ExperienceMode>('AUTO');
  const [effectiveMode, setEffectiveMode] = useState<'2D' | '3D' | '4D'>('4D');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isPortalActive, setIsPortalActive] = useState(false);

  // Auto-detect device capability
  useEffect(() => {
    if (experienceMode === 'AUTO') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;

      if (isMobile && isLowMemory) {
        setEffectiveMode('2D');
      } else if (isMobile || hardwareConcurrency <= 4) {
        setEffectiveMode('3D');
      } else {
        setEffectiveMode('4D');
      }
    } else if (experienceMode === 'INFINITY_3D') {
      setEffectiveMode('3D');
    } else {
      setEffectiveMode(experienceMode as '2D' | '3D' | '4D');
    }
  }, [experienceMode]);

  const refreshPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPublishedPortfolio();
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to load published portfolio:', err);
      setError(err.message || 'Failed to initialize portfolio data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPortfolio();
  }, [refreshPortfolio]);

  const setExperienceMode = (mode: ExperienceMode) => {
    setExperienceModeState(mode);
    soundFx.click(soundEnabled);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      soundFx.startAmbientUnderwater(true);
      soundFx.success(true);
    } else {
      soundFx.stopAmbientUnderwater();
    }
  };

  const triggerPortal = (callback?: () => void) => {
    setIsPortalActive(true);
    soundFx.portalWarp(soundEnabled);
    setTimeout(() => {
      if (callback) callback();
      setTimeout(() => {
        setIsPortalActive(false);
      }, 600);
    }, 1000);
  };

  const updateLiveDraftData = (updated: PortfolioData) => {
    setData(updated);
  };

  return (
    <ThemeContext.Provider
      value={{
        data,
        loading,
        error,
        experienceMode,
        effectiveMode,
        setExperienceMode,
        soundEnabled,
        toggleSound,
        isPreviewMode,
        setIsPreviewMode,
        selectedProject,
        setSelectedProject,
        isPortalActive,
        triggerPortal,
        refreshPortfolio,
        updateLiveDraftData
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
