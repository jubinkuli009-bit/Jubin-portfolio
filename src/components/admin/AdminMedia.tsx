import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Trash2, Copy, Check, Plus } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { MediaItem } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

export const AdminMedia: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'avatar' | 'project' | 'certificate' | 'background' | 'general'>('project');
  const [url, setUrl] = useState('');

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.getMedia();
      setMediaList(res.media);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    setUploading(true);
    try {
      await api.uploadMedia({
        name: title,
        url,
        type: 'image',
        tags: [category]
      });
      soundFx.success();
      setTitle('');
      setUrl('');
      fetchMedia();
    } catch (err: any) {
      alert(err.message || 'Failed to add media asset.');
      soundFx.error();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media asset?')) return;
    try {
      await api.deleteMedia(id);
      soundFx.success();
      fetchMedia();
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
      soundFx.error();
    }
  };

  const copyUrl = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundFx.click();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>ASSET VAULT & MEDIA MANAGER</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase">MEDIA ASSETS</h2>
          <p className="text-xs text-slate-400">
            Manage project screenshots, certificates, textures, and asset URLs.
          </p>
        </div>
      </div>

      {/* Add New Media Form */}
      <form onSubmit={handleAddMedia} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-amber-300 uppercase">ADD ASSET TO VAULT</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1 font-bold">ASSET TITLE *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Quantum Engine Banner"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1 font-bold">CATEGORY TAG</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="project">Project Screenshot</option>
              <option value="avatar">Avatar / Profile</option>
              <option value="certificate">Verified Certificate</option>
              <option value="background">3D Texture / Background</option>
              <option value="general">General Asset</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1 font-bold">IMAGE / ASSET URL *</label>
            <input
              type="url"
              required
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{uploading ? 'REGISTERING ASSET...' : 'REGISTER ASSET'}</span>
          </button>
        </div>
      </form>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && mediaList.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-slate-500 text-xs">
            Loading media vault...
          </div>
        ) : mediaList.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-slate-500 text-xs">
            No media assets registered yet.
          </div>
        ) : (
          mediaList.map(asset => (
            <div
              key={asset.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 rounded-xl overflow-hidden mb-3 bg-slate-900 border border-slate-800">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                  {asset.tags?.[0] && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/90 text-[10px] text-amber-300 font-bold">
                      {asset.tags[0]}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white truncate">{asset.name}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Added {new Date(asset.uploadedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => copyUrl(asset.id, asset.url)}
                  className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white"
                >
                  {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === asset.id ? 'Copied' : 'Copy URL'}</span>
                </button>

                <button
                  onClick={() => handleDelete(asset.id)}
                  className="p-1.5 rounded text-red-400 hover:bg-red-950/40"
                  title="Delete Asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
