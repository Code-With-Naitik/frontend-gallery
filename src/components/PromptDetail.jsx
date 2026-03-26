import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { ArrowLeft, Clipboard, Check, LayoutGrid, Zap, Heart } from 'lucide-react';
import config from '../url/config';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg: #04050d; --card: #0e1120; --border: rgba(255,255,255,0.07); --accent: #6366f1; --accent2: #a855f7; --pink: #ec4899; --text: #f1f0ff; --muted: #6b6d8a; --mono: 'DM Mono', monospace; }
  .pd-root { font-family: 'Syne', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; position: relative; overflow-x: hidden; }
  .pd-glow { position: fixed; border-radius: 50%; filter: blur(130px); pointer-events: none; z-index: 0; }
  .pd-glow-1 { width: 600px; height: 600px; top: -150px; left: -150px; background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%); }
  .pd-glow-2 { width: 500px; height: 500px; bottom: 0; right: -100px; background: radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%); }
  .pd-nav { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 1rem 2.5rem; background: rgba(4,5,13,0.82); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
  .pd-brand { display: flex; align-items: center; gap: 0.6rem; font-size: 1rem; font-weight: 800; letter-spacing: -0.03em; text-decoration: none; color: var(--text); cursor: pointer; background: none; border: none; }
  .pd-brand-icon { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; }
  .pd-back { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.5rem 1rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); border-radius: 10px; color: var(--muted); font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.18s; font-family: 'Syne', sans-serif; }
  .pd-back:hover { border-color: rgba(255,255,255,0.2); color: var(--text); background: rgba(255,255,255,0.08); }
  .pd-hero { position: relative; z-index: 1; width: 100%; max-height: 500px; overflow: hidden; }
  .pd-hero img { width: 100%; height: 500px; object-fit: cover; display: block; }
  .pd-hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(4,5,13,0.1) 0%, rgba(4,5,13,0.97) 100%); }
  .pd-hero-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 2.5rem 2.5rem 2rem; max-width: 1100px; margin: 0 auto; }
  .pd-category-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.8rem; border-radius: 999px; background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.35); font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; color: #a5b4fc; text-transform: uppercase; font-family: var(--mono); margin-bottom: 0.75rem; }
  .pd-hero-content h1 { font-size: clamp(1.8rem, 5vw, 3.5rem); font-weight: 900; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.75rem; }
  .pd-hero-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .pd-tag { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; padding: 0.2rem 0.55rem; border-radius: 5px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: #9ca3af; font-family: var(--mono); }
  .pd-body { position: relative; z-index: 1; max-width: 860px; margin: 0 auto; padding: 3rem 2.5rem 6rem; }
  .pd-prompt-wrap { border-radius: 16px; border: 1px solid var(--border); background: var(--card); overflow: hidden; margin-bottom: 1.5rem; }
  .pd-prompt-header { display: flex; align-items: center; justify-content: space-between; padding: 0.9rem 1.25rem; border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.03); }
  .pd-prompt-header span { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); font-family: var(--mono); }
  .pd-prompt-header .dots { display: flex; gap: 0.35rem; }
  .pd-dot { width: 10px; height: 10px; border-radius: 50%; }
  .pd-dot-r { background: #f87171; } .pd-dot-y { background: #fbbf24; } .pd-dot-g { background: #34d399; }
  pre.pd-prompt-text { padding: 1.5rem; font-family: var(--mono); font-size: 0.9rem; line-height: 1.7; color: #e2e8f0; white-space: pre-wrap; word-break: break-word; background: transparent; }
  .pd-actions { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
  .pd-btn-copy { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.06); border-radius: 12px; color: var(--text); font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif; }
  .pd-btn-copy:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
  .pd-btn-copy.copied { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.35); color: #86efac; }
  .pd-btn-wish { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.06); border-radius: 12px; color: var(--text); font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif; }
  .pd-btn-wish:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
  .pd-btn-wish.liked { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.35); color: #f87171; }
  .pd-meta { font-size: 0.72rem; font-family: var(--mono); color: var(--muted); letter-spacing: 0.04em; }
  .pd-divider { width: 100%; height: 1px; background: var(--border); margin: 2rem 0; }
  .pd-state { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: var(--muted); font-size: 0.85rem; font-family: var(--mono); }
`;

const PromptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/category/${id}`)
      .then(r => setPrompt(r.data))
      .catch(e => setError(e.response?.data?.error || 'Unable to load prompt detail'))
      .finally(() => setLoading(false));
  }, [id]);

  const copyPrompt = async () => {
    if (!prompt?.prompt) return;
    await navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const liked = prompt ? isInWishlist(prompt.id) : false;

  const tags = prompt ? (Array.isArray(prompt.tags) ? prompt.tags : (prompt.tags ? prompt.tags.split(',') : [])) : [];

  if (loading) return (
    <><style>{css}</style>
    <div className="pd-root"><div className="pd-state"><span>Loading prompt details…</span></div></div></>
  );

  if (error) return (
    <><style>{css}</style>
    <div className="pd-root">
      <div className="pd-state" style={{ color: '#fca5a5' }}>
        <span>{error}</span>
        <button onClick={() => navigate(-1)} style={{ marginTop: '1rem', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: '#9ca3af', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'inherit' }}>← Go back</button>
      </div>
    </div></>
  );

  if (!prompt) return null;

  return (
    <><style>{css}</style>
    <div className="pd-root">
      <div className="pd-glow pd-glow-1" /><div className="pd-glow pd-glow-2" />

      {/* NAV */}
      <nav className="pd-nav">
        <button className="pd-brand" onClick={() => navigate('/')}>
          <div className="pd-brand-icon"><LayoutGrid size={16} color="white" /></div>
          Prompt Core
        </button>
        <button className="pd-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back to gallery
        </button>
      </nav>

      {/* HERO IMAGE */}
      <div className="pd-hero">
        <img src={prompt.imageUrl || 'https://via.placeholder.com/1400x500?text=No+Image'} alt={prompt.title} />
        <div className="pd-hero-overlay" />
        <div className="pd-hero-content">
          <div className="pd-category-badge"><Zap size={10} />Prompt</div>
          <h1>{prompt.title || 'Untitled Prompt'}</h1>
          {tags.length > 0 && (
            <div className="pd-hero-tags">
              {tags.map((t, i) => <span key={i} className="pd-tag">{t.trim().replace(/^#/, '')}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="pd-body">
        <div className="pd-prompt-wrap">
          <div className="pd-prompt-header">
            <div className="dots">
              <div className="pd-dot pd-dot-r" /><div className="pd-dot pd-dot-y" /><div className="pd-dot pd-dot-g" />
            </div>
            <span>prompt.txt</span>
            <span style={{ opacity: 0 }}>pad</span>
          </div>
          <pre className="pd-prompt-text">{prompt.prompt || 'No prompt text provided.'}</pre>
        </div>

        <div className="pd-actions">
          <button className={`pd-btn-copy${copied ? ' copied' : ''}`} onClick={copyPrompt}>
            {copied ? <><Check size={15} /> Copied!</> : <><Clipboard size={15} /> Copy Prompt</>}
          </button>
          <button className={`pd-btn-wish${liked ? ' liked' : ''}`} onClick={() => toggleWishlist(prompt)}>
            <Heart size={15} fill={liked ? 'currentColor' : 'none'} /> {liked ? 'Wishlisted' : 'Wishlist'}
          </button>
        </div>

        <div className="pd-divider" />
        <p className="pd-meta">Created: {new Date(prompt.createdAt).toLocaleString()}</p>
      </div>
    </div></>
  );
};

export default PromptDetail;