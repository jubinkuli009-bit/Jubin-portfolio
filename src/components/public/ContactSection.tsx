import React, { useState } from 'react';
import { Radio, Send, CheckCircle, AlertCircle, Sparkles, Mail, User, MessageSquare } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';
import { api } from '../../services/api.ts';
import { soundFx } from '../../utils/audio.ts';

export const ContactSection: React.FC = () => {
  const { data } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!data?.studio2D.sectionsVisible.contact) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.sendContactTransmission({
        name,
        email,
        subject,
        message
      });
      setSuccess(true);
      soundFx.success();
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch transmission.');
      soundFx.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 px-4 max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-3">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>ENCRYPTED SECURE FREQUENCY</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black font-mono tracking-tight text-white uppercase">
          ESTABLISH CONNECTION
        </h2>
        <p className="text-sm font-mono text-cyan-200/70 mt-2 max-w-lg mx-auto">
          Transmit inquiries, architectural proposals, or quantum collaboration requests directly to Mr. Jubin.
        </p>
      </div>

      <div className="p-6 md:p-10 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.15)] font-mono relative overflow-hidden">
        {/* Glowing Top Cyber Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-sky-400" />

        {success ? (
          <div className="py-12 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-cyan-950 border border-cyan-400/50 text-cyan-300 shadow-[0_0_30px_rgba(0,240,255,0.4)] animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white uppercase">
              TRANSMISSION ENCRYPTED & DELIVERED
            </h3>
            <p className="text-xs sm:text-sm text-cyan-200/80 max-w-md mx-auto">
              Your message has been securely recorded into Jubin Control Center. Mr. Jubin will review your dispatch promptly.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                soundFx.click();
              }}
              className="mt-6 px-6 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30 text-xs font-bold transition"
            >
              SEND ANOTHER TRANSMISSION
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1.5 font-bold">NAME *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your Name / Org"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1.5 font-bold">EMAIL *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1.5 font-bold">TRANSMISSION SUBJECT</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Architectural advisory / Project inquiry"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1.5 font-bold">MESSAGE *</label>
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Detail your requirements, project scope, or inquiry..."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-sky-400 text-slate-950 font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:opacity-90 transition shadow-[0_0_30px_rgba(0,240,255,0.4)] disabled:opacity-50 text-sm"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'ENCRYPTING & DISPATCHING...' : 'SEND TRANSMISSION'}</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
