import React from 'react';
import { motion } from 'motion/react';
import { User, Sparkles, Target, Compass, Code, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';

export const AboutSection: React.FC = () => {
  const { data } = useTheme();
  const profile = data?.profile;

  if (!data?.studio2D.sectionsVisible.about) return null;

  return (
    <section id="about" className="relative py-24 px-4 max-w-6xl mx-auto">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-3">
          <User className="w-3.5 h-3.5" />
          <span>QUANTUM ARCHITECT BIOGRAPHY</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black font-mono tracking-tight text-white uppercase">
          ABOUT MR. JUBIN
        </h2>
        <p className="text-sm font-mono text-cyan-200/70 mt-2 max-w-xl mx-auto">
          {profile?.headline || 'Engineering the convergence of 3D graphics, resilient architecture, and interactive design.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Avatar & Quick Info Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-4 space-y-6"
        >
          {/* Hologram Profile Card */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.15)] relative overflow-hidden group transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition" />

            <div className="relative w-36 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.4)] mb-5">
              <img
                src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
                alt={profile?.name || 'Jubin'}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            </div>

            <h3 className="text-xl font-bold font-mono text-center text-white">
              {profile?.name || 'Jubin'}
            </h3>
            <p className="text-xs font-mono text-cyan-300 text-center mt-1">
              {profile?.title || 'Elite Creative Technologist'}
            </p>

            <div className="mt-6 space-y-2.5 pt-4 border-t border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{profile?.location || 'Assam, India / Global'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{profile?.email || 'jubinkuli009@gmail.com'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{profile?.phone || '+91 98765 43210'}</span>
              </div>
              <div className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-[11px] text-center font-semibold animate-pulse">
                ● {profile?.availability || 'Available for Contracts'}
              </div>
            </div>

            {/* Social Links */}
            {profile?.socialLinks && profile.socialLinks.length > 0 && (
              <div className="mt-5 flex items-center justify-center gap-2 pt-3 border-t border-slate-800">
                {profile.socialLinks.map(link => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-800/80 text-cyan-300 hover:text-white hover:bg-cyan-500/30 border border-cyan-500/20 transition"
                    title={link.platform}
                  >
                    <span className="text-xs font-mono font-bold">{link.platform[0]}</span>
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Right Column: Bio, Philosophy, Interests, Goals */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-8 space-y-6"
        >
          {/* Biography & Philosophy Panel */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-6 md:p-8 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.12)]"
          >
            <h3 className="text-lg font-bold font-mono text-cyan-300 flex items-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-cyan-400" />
              DEVELOPMENT PHILOSOPHY & CRAFT
            </h3>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {profile?.philosophy ||
                'Craft is the relentless pursuit of optical, algorithmic, and functional harmony. Code should be clean, resilient, accessible, and an art form in motion.'}
            </p>

            <h4 className="text-sm font-bold font-mono text-teal-300 mt-6 mb-2 uppercase tracking-wider">
              BIOGRAPHY & BACKGROUND
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {profile?.aboutMe || profile?.biography}
            </p>
          </motion.div>

          {/* Interests & High-Impact Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interests / Specializations */}
            <motion.div
              whileHover={{ y: -3 }}
              className="p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-cyan-500/20 shadow-[0_0_20px_rgba(0,240,255,0.08)]"
            >
              <h4 className="text-sm font-bold font-mono text-cyan-300 flex items-center gap-2 mb-4 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AREAS OF FOCUS & RESEARCH
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile?.interests?.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-200 text-xs font-mono"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Strategic Goals */}
            <motion.div
              whileHover={{ y: -3 }}
              className="p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-teal-500/20 shadow-[0_0_20px_rgba(13,148,136,0.08)]"
            >
              <h4 className="text-sm font-bold font-mono text-teal-300 flex items-center gap-2 mb-4 uppercase tracking-wider">
                <Target className="w-4 h-4 text-teal-400" />
                STRATEGIC HORIZONS
              </h4>
              <ul className="space-y-2 text-xs font-mono text-slate-300">
                {profile?.goals?.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-400 font-bold">›</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

