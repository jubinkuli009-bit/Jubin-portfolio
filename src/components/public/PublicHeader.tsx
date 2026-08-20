import React, { useState } from 'react';
import { Lock, Menu, X, Terminal, Compass, Sparkles, LogOut, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { soundFx } from '../../utils/audio.ts';

interface PublicHeaderProps {
  onOpenTerminal: () => void;
  onOpenAdmin: () => void;
  onEnterInfinityWorld?: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  onOpenTerminal,
  onOpenAdmin,
  onEnterInfinityWorld
}) => {
  const { admin, visitor, user, signOutVisitor } = useAuth();
  const { data } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);

  const profile = data?.profile;
  const brandName = profile?.brandName || profile?.name || 'JUBIN';
  const brandLetter = profile?.brandLetter || (brandName ? brandName[0]?.toUpperCase() : 'J');
  const logoUrl = profile?.logoUrl || '';
  const brandTagline = profile?.brandTagline || 'DIGITAL UNIVERSE v2026';

  const navItems = [
    { label: 'HOME', href: '#home' },
    { label: 'ABOUT', href: '#about' },
    { label: 'EDUCATION', href: '#education' },
    { label: 'SKILLS', href: '#skills' },
    { label: 'PROJECTS', href: '#projects' },
    { label: '3D UNIVERSE', href: '#3d-world' },
    { label: 'JOURNEY', href: '#journey' },
    { label: 'CONTACT', href: '#contact' }
  ];

  const handleLogoClick = () => {
    soundFx.click();
    setLogoTapCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        onOpenTerminal();
        return 0;
      }
      return next;
    });
  };

  const handleNavClick = (href: string) => {
    soundFx.hover();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeVisitorName = visitor?.fullName || user?.fullName || (admin ? 'Administrator' : 'Visitor');

  return (
    <header
      id="jubin-public-header"
      className="fixed top-0 left-0 right-0 z-40 px-4 py-3 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/20 font-mono"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogoClick}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
            title="Click 5 times for Quantum Terminal"
          >
            <div className="relative w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:scale-105 transition overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="font-mono font-black text-cyan-300 text-lg">{brandLetter}</span>
              )}
              <div className="absolute -inset-0.5 rounded-xl bg-cyan-400/20 blur-sm -z-10 group-hover:bg-cyan-400/40 transition" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black tracking-widest text-white text-base uppercase truncate max-w-[160px] sm:max-w-none">
                  {brandName}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  ONLINE
                </span>
              </div>
              <p className="text-[10px] font-mono text-cyan-400/70 hidden md:block">{brandTagline}</p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/70 px-3 py-1.5 rounded-full border border-slate-800/80 text-xs">
          {navItems.map(item => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.href)}
              className="px-3 py-1 text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-full transition"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2">
          {/* Quick Infinity 3D Portal Button */}
          {onEnterInfinityWorld && (
            <button
              onClick={() => {
                soundFx.portalWarp();
                onEnterInfinityWorld();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105 transition"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>INFINITY 3D</span>
            </button>
          )}

          {/* Authenticated Visitor Profile Pill & Dedicated Logout Button */}
          {(visitor || user) && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 pl-2.5 pr-1 py-1 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <div className="flex items-center gap-1.5 max-w-[150px] truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[11px] font-bold text-slate-200 truncate">
                  {visitor?.fullName || user?.fullName || 'Visitor'}
                </span>
              </div>
              <button
                onClick={() => {
                  soundFx.click();
                  signOutVisitor();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 hover:text-red-200 transition text-[11px] font-bold cursor-pointer"
                title="Logout of session"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Admin Control Center Button */}
          {admin ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  soundFx.click();
                  onOpenAdmin();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/60 text-amber-300 hover:bg-amber-500/30 transition text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse"
                title="Return to Jubin Control Center"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CONTROL CENTER</span>
                <span className="sm:hidden">ADMIN</span>
              </button>

              <button
                onClick={() => {
                  soundFx.click();
                  signOutVisitor();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 transition text-xs font-bold"
                title="Admin Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                soundFx.click();
                onOpenAdmin();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 transition text-xs font-semibold"
              title="Open Admin Control Center"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">ADMIN</span>
            </button>
          )}

          {/* Terminal Launcher */}
          <button
            onClick={onOpenTerminal}
            className="hidden sm:flex p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition"
            title="Terminal HUD (~)"
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 p-4 rounded-2xl bg-slate-950/95 border border-cyan-500/30">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {navItems.map(item => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="p-2.5 rounded-xl bg-slate-900 text-left text-xs text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/50 border border-slate-800"
              >
                {item.label}
              </button>
            ))}
          </div>

          {onEnterInfinityWorld && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onEnterInfinityWorld();
              }}
              className="w-full mb-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>ENTER INFINITY 3D WORLD</span>
            </button>
          )}

          {/* Mobile Visitor Account & Logout Section */}
          {(visitor || user || admin) && (
            <div className="mb-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden pr-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="truncate text-left">
                  <p className="text-xs text-slate-200 font-bold truncate">
                    {activeVisitorName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {visitor?.email || user?.email || visitor?.phone || 'Verified Access'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOutVisitor();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold shrink-0 hover:bg-red-500/25 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LOGOUT</span>
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="text-cyan-400">System Ready</span>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenTerminal(); }}
              className="text-cyan-400 hover:underline"
            >
              Open Terminal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
