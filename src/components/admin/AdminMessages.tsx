import React, { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle, Clock, Search, RefreshCw, X, Radio, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { ContactMessage } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.getMessages();
      setMessages(res.messages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED') => {
    try {
      await api.updateMessage(id, { status });
      soundFx.success();
      fetchMessages();
      if (selectedMsg && selectedMsg.id === id) {
        setSelectedMsg(prev => prev ? { ...prev, status } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
      soundFx.error();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transmission?')) return;
    try {
      await api.deleteMessage(id);
      soundFx.success();
      if (selectedMsg?.id === id) setSelectedMsg(null);
      fetchMessages();
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
      soundFx.error();
    }
  };

  const filteredMessages = messages.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase()) ||
    (m.subject && m.subject.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
            <Mail className="w-4 h-4" />
            <span>ENCRYPTED INCOMING TRANSMISSIONS</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase">MESSAGES & DISPATCHES</h2>
          <p className="text-xs text-slate-400">
            Direct transmissions from recruiters, founders, and visitors.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter dispatches by sender name, email, subject, or message text..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {loading && messages.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
            Scanning frequencies...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
            No transmissions matching search criteria.
          </div>
        ) : (
          filteredMessages.map(msg => (
            <div
              key={msg.id}
              onClick={() => {
                setSelectedMsg(msg);
                if (msg.status === 'UNREAD') handleUpdateStatus(msg.id, 'READ');
              }}
              className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                msg.status === 'UNREAD'
                  ? 'bg-amber-950/25 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{msg.name}</span>
                  <span className="text-xs text-cyan-400">{msg.email}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      msg.status === 'UNREAD'
                        ? 'bg-amber-400 text-slate-950'
                        : msg.status === 'REPLIED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans font-medium line-clamp-1">
                  {msg.subject ? `${msg.subject}: ` : ''}{msg.message}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 text-xs text-slate-500 self-end sm:self-auto">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(msg.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Inspection Lightbox */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative max-w-xl w-full rounded-3xl bg-slate-900 border border-amber-500/50 p-6 space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.25)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <Mail className="w-4 h-4" />
                <span>TRANSMISSION DETAILS</span>
              </div>
              <button
                onClick={() => setSelectedMsg(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">SENDER</span>
                  <div className="font-bold text-white text-sm">{selectedMsg.name}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">REPLY EMAIL</span>
                  <div className="text-cyan-300 font-bold">{selectedMsg.email}</div>
                </div>
              </div>

              {selectedMsg.subject && (
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">SUBJECT</span>
                  <div className="text-white font-medium">{selectedMsg.subject}</div>
                </div>
              )}

              <div>
                <span className="text-slate-500 uppercase text-[10px]">MESSAGE CONTENT</span>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs whitespace-pre-wrap leading-relaxed font-sans mt-1">
                  {selectedMsg.message}
                </div>
              </div>

              <div className="text-[10px] text-slate-500">
                Received on {new Date(selectedMsg.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => handleDelete(selectedMsg.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-950/60 text-red-400 border border-red-500/30 text-xs hover:bg-red-900"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>DELETE</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject || 'Inquiry to Mr. Jubin'}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300"
                  onClick={() => handleUpdateStatus(selectedMsg.id, 'REPLIED')}
                >
                  <span>REPLY VIA EMAIL</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
