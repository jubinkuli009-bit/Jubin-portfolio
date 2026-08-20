import React from 'react';
import { Shield, Lock, Sparkles, Terminal, Code2, Heart, ArrowUp, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { soundFx } from '../../utils/audio.ts';

export const PublicFooter: React.FC = () => {
  const { visitor, user, admin, openAuthModal, signOutVisitor } = useAuth();
  const { data } = useTheme();

  const profile = data?.profile;
  const brandName = profile?.brandName || profile?.name || 'Jubin';
  const brandLetter = profile?.brandLetter || (brandName ? brandName[0]?.toUpperCase() : 'J');
  const logoUrl = profile?.logoUrl || '';

  const scrollToTop = () => {
    soundFx.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeVisitor = visitor?.fullName || user?.fullName || (admin ? 'Administrator' : null);

  return (
    <footer
      id="jubin-public-footer"
      className="relative z-10 pt-16 pb-24 border-t border-cyan-500/20 bg-slate-950/90 backdrop-blur-xl font-mono text-xs"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Developer Branding */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Brand Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-cyan-300 font-black text-lg">{brandLetter}</span>
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-widest uppercase">
                Developed by {brandName}
              </div>
              <p className="text-[11px] text-cyan-400/80">
                {profile?.title || 'Creative Developer & Full-Stack Systems Architect'}
              </p>
            </div>
          </div>

          {/* Quick Back to Top & Session Management */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {activeVisitor && (
              <button
                onClick={() => {
                  soundFx.click();
                  signOutVisitor();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 transition text-xs"
                title="Log Out Active Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LOGOUT ({activeVisitor})</span>
              </button>
            )}

            <button
              onClick={() => {
                soundFx.click();
                openAuthModal('admin');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 hover:border-amber-400 transition text-xs"
              title="Open Admin Control Center"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>ADMIN PORTAL</span>
            </button>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition"
            >
              <span>RETURN TO SUMMIT</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Copyright & Security Notice */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-center sm:text-left">
          <p>© 2026 Jubin. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-cyan-400">
              <Shield className="w-3.5 h-3.5" />
              PBKDF2 Encrypted Vault
            </span>
            <span className="text-slate-600">|</span>
            <span>WebGL 2.0 / 4D Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
