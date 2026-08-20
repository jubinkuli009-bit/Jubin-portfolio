import React from 'react';
import { Compass, Sparkles, CheckCircle2, Waves, Milestone } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';

export const JourneySection: React.FC = () => {
  const { data } = useTheme();
  const milestones = data?.journey || [];

  if (!data?.studio2D.sectionsVisible.journey || milestones.length === 0) return null;

  const getPhaseBadge = (phase: string) => {
    switch (phase) {
      case 'Quantum':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
      case 'Epipelagic':
        return 'bg-sky-950/80 text-sky-300 border-sky-500/40 shadow-[0_0_10px_rgba(56,189,248,0.3)]';
      case 'Bioluminescent':
        return 'bg-teal-950/80 text-teal-300 border-teal-500/40 shadow-[0_0_10px_rgba(20,184,166,0.3)]';
      case 'Abyssal':
      default:
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.3)]';
    }
  };

  return (
    <section id="journey" className="relative py-24 px-4 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-3">
          <Milestone className="w-3.5 h-3.5" />
          <span>TEMPORAL MILESTONES & EXPEDITION</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black font-mono tracking-tight text-white uppercase">
          DEVELOPER JOURNEY
        </h2>
        <p className="text-sm font-mono text-cyan-200/70 mt-2 max-w-xl mx-auto">
          The continuous evolution of technical craft, spatial exploration, and leadership.
        </p>
      </div>

      {/* Interactive Timeline Stream */}
      <div className="space-y-8">
        {milestones.map((item, idx) => (
          <div
            key={item.id}
            className="p-6 md:p-8 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.06)] hover:shadow-[0_0_40px_rgba(0,240,255,0.18)] transition-all duration-300 font-mono relative overflow-hidden group"
          >
            {/* Ambient Background Glow on Hover */}
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/15 transition duration-500" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  {item.year}
                </span>
                <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full border font-bold ${getPhaseBadge(item.environmentPhase)}`}>
                  {item.environmentPhase} Phase
                </span>
              </div>
              <span className="text-xs text-slate-400 font-sans font-medium">
                {item.companyOrContext}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">
              {item.title}
            </h3>
            <p className="text-xs text-teal-300 font-semibold mt-0.5">{item.role}</p>

            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-3 leading-relaxed">
              {item.description}
            </p>

            {item.highlights && item.highlights.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                {item.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-200/90 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
