import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  Check,
  Globe,
  Camera,
  Upload,
  RefreshCw,
  Smartphone,
  CheckCircle,
  Tag,
  Layers,
  Link as LinkIcon,
  Smile,
  Shield,
  Eye,
  Info
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { PortfolioData, UserProfile, SocialLink } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';
import { processImageFile } from '../../utils/imageUpload.ts';

interface AdminProfileProps {
  draftData: PortfolioData | null;
  onUpdateDraft: (updated: PortfolioData) => void;
}

export const AdminProfile: React.FC<AdminProfileProps> = ({ draftData, onUpdateDraft }) => {
  const [profile, setProfile] = useState<UserProfile>(
    draftData?.profile || {
      name: 'Jubin',
      brandName: 'Jubin',
      brandLetter: 'J',
      logoUrl: '',
      brandTagline: 'DIGITAL UNIVERSE v2026',
      title: 'Creative Technologist & Full-Stack Architect',
      headline: 'Architecting High-Performance 3D Web Experiences...',
      subtitle: 'Creative Developer • Full-Stack Web Developer • 3D/WebGL Engineer',
      introduction: 'Welcome to my digital universe.',
      aboutMe: '',
      biography: '',
      philosophy: '',
      avatarUrl: '',
      email: 'jubinkuli009@gmail.com',
      phone: '+91 98765 43210',
      location: 'Assam, India / Global Remote',
      availability: 'Open for High-Impact Projects',
      interests: [],
      goals: [],
      socialLinks: [],
      stats: []
    }
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [newInterest, setNewInterest] = useState('');
  const [newGoal, setNewGoal] = useState('');

  // Hidden File Input Refs (Triggered by button click on phone/desktop)
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (draftData?.profile) {
      setProfile(prev => ({
        ...prev,
        ...draftData.profile,
        brandName: draftData.profile.brandName || draftData.profile.name || 'Jubin',
        brandLetter: draftData.profile.brandLetter || (draftData.profile.brandName || 'Jubin')[0] || 'J',
        logoUrl: draftData.profile.logoUrl || '',
        brandTagline: draftData.profile.brandTagline || 'DIGITAL UNIVERSE v2026'
      }));
    }
  }, [draftData?.profile]);

  // Handle Logo Upload from Mobile Phone Gallery / File Picker
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      soundFx.click();
      const processedDataUrl = await processImageFile(file, 800, 0.95);
      
      setProfile(prev => ({
        ...prev,
        logoUrl: processedDataUrl
      }));
      soundFx.success();
    } catch (err: any) {
      alert(err.message || 'Failed to process logo image.');
      soundFx.error();
    } finally {
      setUploadingLogo(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handle Profile Avatar Upload from Mobile Phone Gallery / File Picker
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      soundFx.click();
      const processedDataUrl = await processImageFile(file, 1000, 0.92);
      
      setProfile(prev => ({
        ...prev,
        avatarUrl: processedDataUrl
      }));
      soundFx.success();
    } catch (err: any) {
      alert(err.message || 'Failed to process profile image.');
      soundFx.error();
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftData) return;

    setSaving(true);
    try {
      const sanitizedProfile: UserProfile = {
        ...profile,
        brandName: profile.brandName?.trim() || profile.name?.trim() || 'Jubin',
        brandLetter: profile.brandLetter?.trim() || (profile.brandName || profile.name || 'Jubin')[0]?.toUpperCase() || 'J'
      };

      const updatedDraft: PortfolioData = {
        ...draftData,
        profile: sanitizedProfile
      };

      await api.updateDraft({ profile: sanitizedProfile });
      onUpdateDraft(updatedDraft);
      soundFx.success();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save profile.');
      soundFx.error();
    } finally {
      setSaving(false);
    }
  };

  // Avatar Presets
  const avatarPresets = [
    { label: 'Cyber Architect', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80' },
    { label: 'Quantum Hologram', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80' },
    { label: 'Modern Developer', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Tech Specialist', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80' }
  ];

  const addInterest = () => {
    if (!newInterest.trim()) return;
    setProfile(prev => ({
      ...prev,
      interests: [...(prev.interests || []), newInterest.trim()]
    }));
    setNewInterest('');
  };

  const removeInterest = (idx: number) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== idx)
    }));
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setProfile(prev => ({
      ...prev,
      goals: [...(prev.goals || []), newGoal.trim()]
    }));
    setNewGoal('');
  };

  const removeGoal = (idx: number) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== idx)
    }));
  };

  const addSocialLink = () => {
    const newLink: SocialLink = {
      id: `soc-${Date.now()}`,
      platform: 'GitHub',
      url: 'https://github.com',
      icon: 'Github'
    };
    setProfile(prev => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), newLink]
    }));
  };

  const removeSocialLink = (id: string) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter(l => l.id !== id)
    }));
  };

  const updateSocialLink = (id: string, field: keyof SocialLink, val: string) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(l => (l.id === id ? { ...l, [field]: val } : l))
    }));
  };

  const updateStat = (index: number, field: 'label' | 'value' | 'suffix', val: string) => {
    const currentStats = [...(profile.stats || [])];
    if (currentStats[index]) {
      currentStats[index] = { ...currentStats[index], [field]: val };
      setProfile(prev => ({ ...prev, stats: currentStats }));
    }
  };

  const addStat = () => {
    const newStat = { label: 'Metric', value: '100+' };
    setProfile(prev => ({ ...prev, stats: [...(prev.stats || []), newStat] }));
  };

  const removeStat = (idx: number) => {
    setProfile(prev => ({ ...prev, stats: (prev.stats || []).filter((_, i) => i !== idx) }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-mono pb-12">
      {/* Hidden File Inputs for Mobile Gallery & Desktop Pickers */}
      <input
        type="file"
        ref={logoFileInputRef}
        onChange={handleLogoFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={avatarFileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>BRANDING & PROFILE STUDIO</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase">BRAND IDENTITY & PROFILE CONTROL</h2>
          <p className="text-xs text-slate-400">
            Customize Brand Name, Upload Brand Logo from your phone gallery, change your Profile Picture, and manage bios.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.35)] transition disabled:opacity-50 cursor-pointer"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'SAVING CHANGES...' : savedSuccess ? 'CHANGES SAVED!' : 'SAVE BRAND & PROFILE'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-amber-950/70 border border-amber-500 text-amber-300 text-xs flex items-center gap-2.5 shadow-[0_0_25px_rgba(245,158,11,0.2)] animate-fade-in">
          <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Brand and profile changes updated in draft memory! Click <strong>"Publish Changes"</strong> to deploy live to the world.</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. BRAND NAME & LOGO STUDIO SECTION (Brand Name + Phone Gallery Logo) */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>1. BRAND NAME & LOGO CUSTOMIZATION</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Change the brand title (currently: <strong>{profile.brandName || 'Jubin'}</strong>) and upload custom logo image from your phone gallery.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px]">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mobile Gallery Supported</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Logo Visual Live Preview Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-slate-300 block uppercase">
                ACTIVE BRAND LOGO PREVIEW
              </span>

              <div className="flex items-center gap-4">
                {/* Logo Display Container */}
                <div className="relative w-20 h-20 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400/70 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.35)] overflow-hidden shrink-0 group">
                  {profile.logoUrl ? (
                    <img
                      src={profile.logoUrl}
                      alt="Brand Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-black text-cyan-300 text-3xl font-mono">
                      {profile.brandLetter || 'J'}
                    </span>
                  )}
                </div>

                {/* Live Header Simulation Pill */}
                <div className="flex-1 space-y-1.5">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Public Header Simulation:
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-cyan-500/30">
                    <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-400/50 flex items-center justify-center overflow-hidden shrink-0">
                      {profile.logoUrl ? (
                        <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-cyan-300 font-bold text-xs">{profile.brandLetter || 'J'}</span>
                      )}
                    </div>
                    <span className="font-bold text-white text-xs tracking-wider uppercase truncate">
                      {profile.brandName || 'JUBIN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logo Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingLogo ? 'Processing...' : 'Upload from Phone'}</span>
                </button>

                {profile.logoUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      setProfile(prev => ({ ...prev, logoUrl: '' }));
                      soundFx.click();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset to '{profile.brandLetter || 'J'}'</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Select Image</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Brand Fields (Name + Monogram + Tagline) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs text-amber-300 mb-1 font-bold">
                  BRAND NAME * (Currently: {profile.brandName || 'Jubin'})
                </label>
                <input
                  type="text"
                  required
                  value={profile.brandName || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setProfile(prev => ({
                      ...prev,
                      brandName: val,
                      // Automatically update monogram if user hasn't set custom symbol
                      brandLetter: prev.brandLetter && prev.brandLetter.length > 1 ? prev.brandLetter : (val[0]?.toUpperCase() || 'J')
                    }));
                  }}
                  placeholder="e.g. Jubin, Apex Labs, CyberCore..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-sm text-white font-bold placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">
                  MONOGRAM MARK
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={profile.brandLetter || ''}
                  onChange={e => setProfile(prev => ({ ...prev, brandLetter: e.target.value.toUpperCase() }))}
                  placeholder="J"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-sm text-center text-cyan-300 font-black focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">
                BRAND TAGLINE (Public Header / Footer Slogan)
              </label>
              <input
                type="text"
                value={profile.brandTagline || ''}
                onChange={e => setProfile(prev => ({ ...prev, brandTagline: e.target.value }))}
                placeholder="e.g. DIGITAL UNIVERSE v2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-xs text-white placeholder:text-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-bold">
                OR LOGO IMAGE URL (Optional Direct Link)
              </label>
              <input
                type="url"
                value={profile.logoUrl || ''}
                onChange={e => setProfile(prev => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="https://... or upload directly from phone above"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROFILE PICTURE & AVATAR MANAGER (Upload from Phone Gallery) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Avatar & Photo Manager */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>2. PROFILE PICTURE (PHONE GALLERY)</span>
              </h3>
            </div>

            {/* Avatar Preview Display */}
            <div className="relative w-44 h-44 mx-auto rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.25)] bg-slate-900 group">
              <img
                src={
                  profile.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
                }
                alt="Profile Avatar"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Upload from Phone Gallery Button */}
            <button
              type="button"
              onClick={() => avatarFileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>{uploadingAvatar ? 'Uploading Image...' : 'Upload Photo from Phone Gallery'}</span>
            </button>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-bold">OR CUSTOM PHOTO URL</label>
              <input
                type="url"
                value={profile.avatarUrl || ''}
                onChange={e => setProfile(prev => ({ ...prev, avatarUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/... or your custom photo link"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Avatar Presets Selector */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">OR PICK A PRESET AVATAR:</span>
              <div className="grid grid-cols-4 gap-2">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setProfile(prev => ({ ...prev, avatarUrl: preset.url }));
                      soundFx.click();
                    }}
                    className="relative rounded-xl overflow-hidden border border-slate-700 hover:border-amber-400 aspect-square group transition"
                    title={preset.label}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Social Links Manager */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>SOCIAL MATRICES</span>
              </h3>
              <button
                type="button"
                onClick={addSocialLink}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-3">
              {profile.socialLinks?.map(link => (
                <div key={link.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={link.platform}
                      onChange={e => updateSocialLink(link.id, 'platform', e.target.value)}
                      placeholder="Platform Name (GitHub, LinkedIn, Twitter...)"
                      className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-white font-bold w-2/3"
                    />
                    <button
                      type="button"
                      onClick={() => removeSocialLink(link.id)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="url"
                    value={link.url}
                    onChange={e => updateSocialLink(link.id, 'url', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-[11px] text-cyan-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Name, Titles, Bios, Philosophy, Stats */}
        <div className="lg:col-span-7 space-y-6">
          {/* Identity Info */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              3. CORE IDENTITY INFORMATION
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">FULL NAME *</label>
                <input
                  type="text"
                  required
                  value={profile.name || ''}
                  onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Mr. Jubin"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">PROFESSIONAL TITLE</label>
                <input
                  type="text"
                  value={profile.title || ''}
                  onChange={e => setProfile(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Creative Technologist & Full-Stack Architect"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">PROFILE HEADLINE</label>
              <input
                type="text"
                value={profile.headline || ''}
                onChange={e => setProfile(prev => ({ ...prev, headline: e.target.value }))}
                placeholder="Architecting High-Performance 3D Web Experiences..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">HERO SUBTITLE</label>
              <input
                type="text"
                value={profile.subtitle || ''}
                onChange={e => setProfile(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Creative Developer • Full-Stack Web Developer • 3D/WebGL Engineer"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">SHORT INTRODUCTION (HERO BANNER)</label>
              <textarea
                rows={2}
                value={profile.introduction || ''}
                onChange={e => setProfile(prev => ({ ...prev, introduction: e.target.value }))}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-bold">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-bold">PHONE NUMBER</label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-bold">LOCATION</label>
                <input
                  type="text"
                  value={profile.location || ''}
                  onChange={e => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-bold">AVAILABILITY STATUS</label>
              <input
                type="text"
                value={profile.availability || ''}
                onChange={e => setProfile(prev => ({ ...prev, availability: e.target.value }))}
                placeholder="Open for High-Impact Projects & Architectural Advisory"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Biography & Philosophy */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              4. EXTENDED STORY & PHILOSOPHY
            </h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">ABOUT ME (ABOUT SECTION)</label>
              <textarea
                rows={3}
                value={profile.aboutMe || ''}
                onChange={e => setProfile(prev => ({ ...prev, aboutMe: e.target.value }))}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">FULL BIOGRAPHY & BACKGROUND</label>
              <textarea
                rows={4}
                value={profile.biography || ''}
                onChange={e => setProfile(prev => ({ ...prev, biography: e.target.value }))}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">ENGINEERING PHILOSOPHY</label>
              <textarea
                rows={2}
                value={profile.philosophy || ''}
                onChange={e => setProfile(prev => ({ ...prev, philosophy: e.target.value }))}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>
          </div>

          {/* Stats Counters */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                5. LIVE STATS COUNTERS
              </h3>
              <button
                type="button"
                onClick={addStat}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Stat</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.stats?.map((stat, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={stat.label}
                      onChange={e => updateStat(idx, 'label', e.target.value)}
                      placeholder="Label"
                      className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-white font-bold w-2/3"
                    />
                    <button
                      type="button"
                      onClick={() => removeStat(idx)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={e => updateStat(idx, 'value', e.target.value)}
                    placeholder="Value (e.g. 6+, 100%)"
                    className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-amber-300 font-bold"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
