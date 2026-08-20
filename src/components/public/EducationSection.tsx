import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Award, Calendar, BookOpen, ExternalLink, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';
import type { EducationItem } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

export const EducationSection: React.FC = () => {
  const { data } = useTheme();
  const educationList = data?.education || [];
  const [selectedCert, setSelectedCert] = useState<EducationItem | null>(null);

  if (!data?.studio2D.sectionsVisible.education || educationList.length === 0) return null;

  return (
    <section id="education" className="relative py-24 px-4 max-w-6xl mx-auto">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-3">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>ACADEMIC FOUNDATION & MASTERY</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black font-mono tracking-tight text-white uppercase">
          EDUCATION & CREDENTIALS
        </h2>
        <p className="text-sm font-mono text-cyan-200/70 mt-2 max-w-xl mx-auto">
          Rigorous computer science specializations, graphics algorithms, and cloud systems engineering.
        </p>
      </motion.div>

      {/* Interactive Futuristic Timeline */}
      <div className="relative border-l-2 border-cyan-500/30 ml-4 md:ml-32 space-y-12 pl-6 md:pl-10">
        {educationList.map((edu, idx) => (
          <motion.div
            key={edu.id}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="relative group"
          >
            {/* Timeline Node Point */}
            <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.8)] group-hover:scale-125 group-hover:bg-cyan-500 transition duration-300">
              <div className="w-2 h-2 rounded-full bg-cyan-300" />
            </div>

            {/* Year Tag on Desktop */}
            <div className="hidden md:block absolute -left-36 top-1 font-mono text-xs text-cyan-400 font-bold tracking-wider">
              {edu.year}
            </div>

            {/* Card Content */}
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-400/60 shadow-[0_0_25px_rgba(0,240,255,0.08)] transition duration-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="md:hidden inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                  <Calendar className="w-3 h-3" />
                  {edu.year}
                </span>
                {edu.grade && (
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 text-xs font-mono font-semibold border border-teal-500/30">
                    {edu.grade}
                  </span>
                )}
              </div>

              <h3 className="text-lg md:text-xl font-bold font-mono text-white group-hover:text-cyan-300 transition">
                {edu.qualification}
              </h3>
              <p className="text-sm font-mono text-cyan-400/90 font-medium mt-0.5">
                {edu.institution} — <span className="text-slate-300">{edu.field}</span>
              </p>

              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                {edu.description}
              </p>

              {/* Certificate Verification Trigger */}
              {edu.certificateUrl && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => {
                      setSelectedCert(edu);
                      soundFx.click();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-mono hover:bg-cyan-500/25 transition"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>VIEW VERIFIED CREDENTIAL</span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Certificate Lightbox Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-2xl w-full rounded-3xl bg-slate-900 border border-cyan-500/50 shadow-[0_0_50px_rgba(0,240,255,0.3)] overflow-hidden p-6"
            >
              <button
                onClick={() => setSelectedCert(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-4">
                <Award className="w-4 h-4" />
                <span>OFFICIAL CERTIFICATION DOCUMENT</span>
              </div>
              <h4 className="text-lg font-bold font-mono text-white mb-1">
                {selectedCert.qualification}
              </h4>
              <p className="text-xs font-mono text-slate-400 mb-4">{selectedCert.institution}</p>
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={selectedCert.certificateUrl}
                  alt={selectedCert.qualification}
                  className="w-full h-80 object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

