import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Sparkles, X, Play, Code2, Zap } from 'lucide-react';
import { soundFx } from '../../utils/audio.ts';

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EasterEggModal: React.FC<EasterEggModalProps> = ({ isOpen, onClose }) => {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<string[]>([
    '>>> JUBIN QUANTUM KERNEL v2026.4D INITIALIZED',
    '>>> ENCRYPTION: AES-256-GCM / PBKDF2 HARDENED',
    '>>> UNDERWATER CAUSTIC SUB-SYSTEM: ONLINE',
    '>>> Type "help", "matrix", "synth", "about", or "clear" for commands.'
  ]);

  useEffect(() => {
    if (isOpen) {
      soundFx.hover();
    }
  }, [isOpen]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const cmd = command.trim().toLowerCase();
    let response = '';

    switch (cmd) {
      case 'help':
        response = 'AVAILABLE COMMANDS: help, matrix, synth, jubin, secret, clear, date, ping';
        break;
      case 'matrix':
        response = 'ENTER THE MATRIX: 01001010 01010101 01000010 01001001 01001110 (JUBIN)';
        soundFx.portalWarp();
        break;
      case 'synth':
        response = 'PLAYING PROCEDURAL QUANTUM HARMONICS...';
        soundFx.success();
        break;
      case 'jubin':
      case 'about':
        response = 'MR. JUBIN — Elite Creative Technologist, WebGL Specialist & Full-Stack Architect. Building the future of spatial computing.';
        break;
      case 'secret':
        response = 'EASTER EGG UNLOCKED: You found the secret terminal! You are a true developer of curiosity. Keep exploring!';
        soundFx.success();
        break;
      case 'ping':
        response = 'PONG! Latency: 0.42ms | Quantum Link Stable.';
        break;
      case 'date':
        response = `CURRENT SYSTEM TIME: ${new Date().toISOString()}`;
        break;
      case 'clear':
        setLogs([]);
        setCommand('');
        return;
      default:
        response = `COMMAND NOT RECOGNIZED: "${cmd}". Type "help" for assistance.`;
        soundFx.error();
    }

    setLogs(prev => [...prev, `> ${command}`, `>>> ${response}`]);
    setCommand('');
  };

  if (!isOpen) return null;

  return (
    <div
      id="jubin-easter-egg-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border border-cyan-500/50 shadow-[0_0_50px_rgba(0,240,255,0.3)] overflow-hidden font-mono">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-cyan-400">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>JUBIN_QUANTUM_TERMINAL // SECURE_SHELL</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Logs Area */}
        <div className="p-4 h-64 overflow-y-auto space-y-1 text-xs text-emerald-400 bg-slate-950/95 font-mono">
          {logs.map((log, index) => (
            <div key={index} className={log.startsWith('>>>') ? 'text-cyan-300' : 'text-slate-300'}>
              {log}
            </div>
          ))}
        </div>

        {/* Terminal Input */}
        <form onSubmit={handleCommand} className="flex items-center border-t border-slate-800 bg-slate-900/60 px-4 py-2">
          <span className="text-cyan-400 text-sm mr-2">{'>'}</span>
          <input
            type="text"
            value={command}
            onChange={e => setCommand(e.target.value)}
            placeholder="Type 'help' or command..."
            autoFocus
            className="w-full bg-transparent text-sm text-cyan-200 outline-none placeholder:text-slate-600 font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/40 hover:bg-cyan-500/30"
          >
            EXEC
          </button>
        </form>
      </div>
    </div>
  );
};
