import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Trash2, Edit2, Plus, X, Save, Loader2, LogOut, LayoutGrid,
  User, Search, Image, UploadCloud, FileText,
  Sparkles, Tag, ChevronRight, AlertCircle, CheckCircle2, Menu
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import config from '../url/config';

const API_URL = `${config.API_BASE_URL}/category`;

/* ─── tiny helpers ─── */
const Tag_ = ({ label }) => (
  <span style={{
    display: 'inline-block', padding: '2px 10px',
    background: 'rgba(139,92,246,.15)', color: '#a78bfa',
    borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
    border: '1px solid rgba(139,92,246,.25)', letterSpacing: '.05em'
  }}>{label}</span>
);

const Toast = ({ msg }) => {
  if (!msg.text) return null;
  const isErr = msg.type === 'error';
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 20px', borderRadius: 16,
      background: isErr ? 'rgba(239,68,68,.12)' : 'rgba(34,197,94,.12)',
      border: `1px solid ${isErr ? 'rgba(239,68,68,.3)' : 'rgba(34,197,94,.3)'}`,
      color: isErr ? '#f87171' : '#4ade80',
      fontWeight: 700, fontSize: '0.875rem',
      backdropFilter: 'blur(20px)',
      boxShadow: isErr ? '0 8px 32px rgba(239,68,68,.2)' : '0 8px 32px rgba(34,197,94,.2)',
      animation: 'slideIn .3s ease'
    }}>
      {isErr ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      {msg.text}
    </div>
  );
};

/* ─── main component ─── */
const AdminPanel = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', imageUrl: '', prompt: '', tags: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const { admin, adminToken, adminLogout } = useAuth();

  useEffect(() => { fetchCategories(); }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: '', text: '' }), 3500);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setCategories(response.data);
      setError(null);
    } catch { setError('Could not connect to database'); }
    finally { setLoading(false); }
  };

  const handleFileChange = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFileChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    let finalImageUrl = formData.imageUrl;
    try {
      if (selectedFile) {
        const fd = new FormData();
        fd.append('image', selectedFile);
        const res = await axios.post(`${config.API_BASE_URL}/api/upload`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalImageUrl = res.data.imageUrl;
      }
      const payload = {
        ...formData, imageUrl: finalImageUrl,
        tags: formData.tags.split(',').map(t => {
          const s = t.trim(); return s.startsWith('#') ? s : `#${s}`;
        }).filter(t => t !== '#')
      };
      const cfg = { headers: { Authorization: `Bearer ${adminToken}` } };
      if (editingCategory) await axios.put(`${API_URL}/${editingCategory.id}`, payload, cfg);
      else await axios.post(API_URL, payload, cfg);
      closeModal();
      fetchCategories();
      showToast('success', editingCategory ? 'Record updated!' : 'New record created!');
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Operation failed');
    } finally { setIsUploading(false); }
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      title: cat.title, imageUrl: cat.imageUrl, prompt: cat.prompt,
      tags: Array.isArray(cat.tags) ? cat.tags.join(', ') : cat.tags || ''
    });
    setFilePreview(null); setSelectedFile(null); setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this record?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      fetchCategories();
      showToast('success', 'Record deleted');
    } catch { showToast('error', 'Deletion failed'); }
  };

  const closeModal = () => {
    setIsModalOpen(false); setEditingCategory(null);
    setFormData({ title: '', imageUrl: '', prompt: '', tags: '' });
    setSelectedFile(null); setFilePreview(null);
  };

  const filtered = categories.filter(c =>
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ─── styles ─── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #07080f; color: #e2e8f0; }

    :root {
      --bg: #07080f;
      --surface: rgba(255,255,255,.03);
      --surface-hover: rgba(255,255,255,.06);
      --border: rgba(255,255,255,.07);
      --border-bright: rgba(139,92,246,.4);
      --accent: #8b5cf6;
      --accent2: #06b6d4;
      --danger: #ef4444;
      --text: #e2e8f0;
      --muted: #64748b;
      --sidebar-w: 240px;
    }

    @keyframes slideIn { from { opacity:0; transform:translateY(-12px);} to {opacity:1;transform:translateY(0);} }
    @keyframes fadeUp  { from { opacity:0; transform:translateY(20px);} to {opacity:1;transform:translateY(0);} }
    @keyframes pulse   { 0%,100%{opacity:.6} 50%{opacity:1} }
    @keyframes spin    { to { transform:rotate(360deg); } }
    @keyframes modalIn { from{opacity:0;transform:scale(.96) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }

    .admin-layout {
      display: flex; min-height: 100vh;
      background: var(--bg);
      font-family: 'DM Sans', sans-serif;
    }

    /* ── sidebar ── */
    .sidebar {
      width: var(--sidebar-w); flex-shrink: 0;
      background: rgba(255,255,255,.02);
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column;
      position: fixed; top:0; left:0; height:100vh;
      z-index: 100;
      transition: transform .3s ease;
    }
    .sidebar-brand {
      display:flex; align-items:center; gap:10px;
      padding: 28px 20px 24px;
      font-family:'Syne',sans-serif; font-weight:800;
      font-size:1.1rem; letter-spacing:-.02em;
      border-bottom:1px solid var(--border);
    }
    .sidebar-brand .dot {
      width:8px;height:8px;border-radius:50%;
      background:var(--accent);
      box-shadow:0 0 8px var(--accent);
      animation:pulse 2s infinite;
    }
    .sidebar-nav { flex:1; padding:16px 10px; display:flex; flex-direction:column; gap:4px; }
    .sidebar-nav a {
      display:flex; align-items:center; gap:12px;
      padding:11px 14px; border-radius:12px;
      color:var(--muted); text-decoration:none;
      font-size:.875rem; font-weight:600;
      transition:all .2s;
    }
    .sidebar-nav a:hover { color:var(--text); background:var(--surface-hover); }
    .sidebar-nav a.active {
      color:var(--text); background:rgba(139,92,246,.12);
      border:1px solid rgba(139,92,246,.2);
    }
    .sidebar-nav a.active svg { color:var(--accent); }
    .sidebar-footer { padding:16px 10px 24px; border-top:1px solid var(--border); }
    .logout-btn {
      width:100%; display:flex; align-items:center; gap:12px;
      padding:11px 14px; border-radius:12px;
      background:transparent; border:none; color:var(--muted);
      font-size:.875rem; font-weight:600; cursor:pointer;
      transition:all .2s;
    }
    .logout-btn:hover { color:#f87171; background:rgba(239,68,68,.08); }

    /* ── main ── */
    .admin-main {
      flex:1; margin-left:var(--sidebar-w);
      display:flex; flex-direction:column;
      min-height:100vh; overflow:hidden;
    }

    /* ── top bar ── */
    .top-bar {
      display:flex; align-items:center; justify-content:space-between;
      padding:16px 28px; gap:16px;
      border-bottom:1px solid var(--border);
      background:rgba(7,8,15,.8); backdrop-filter:blur(20px);
      position:sticky; top:0; z-index:50;
    }
    .search-box {
      display:flex; align-items:center; gap:10px;
      background:var(--surface); border:1px solid var(--border);
      border-radius:12px; padding:10px 16px;
      flex:1; max-width:420px;
    }
    .search-box input {
      background:none; border:none; outline:none;
      color:var(--text); font-size:.875rem;
      width:100%; font-family:'DM Sans',sans-serif;
    }
    .search-box input::placeholder { color:var(--muted); }
    .user-chip {
      display:flex; align-items:center; gap:10px;
      padding:8px 14px; border-radius:12px;
      background:var(--surface); border:1px solid var(--border);
      cursor:pointer; text-decoration:none; transition:all .2s;
    }
    .user-chip:hover { background:var(--surface-hover); border-color:var(--border-bright); }
    .user-avatar {
      width:34px; height:34px; border-radius:10px;
      background:rgba(139,92,246,.2);
      display:flex; align-items:center; justify-content:center;
      color:var(--accent);
    }
    .hamburger {
      display:none; background:var(--surface); border:1px solid var(--border);
      color:var(--text); padding:8px; border-radius:10px; cursor:pointer;
    }

    /* ── content ── */
    .content-area { flex:1; padding:28px; overflow-y:auto; }
    .page-header {
      display:flex; align-items:flex-start; justify-content:space-between;
      gap:16px; margin-bottom:32px; flex-wrap:wrap;
    }
    .page-title { font-family:'Syne',sans-serif; font-size:1.75rem; font-weight:800; letter-spacing:-.04em; }
    .page-sub { color:var(--muted); font-size:.875rem; margin-top:4px; }
    .add-btn {
      display:flex; align-items:center; gap:8px;
      padding:12px 20px; border-radius:14px;
      background:linear-gradient(135deg,#8b5cf6,#6d28d9);
      color:#fff; font-size:.875rem; font-weight:700;
      border:none; cursor:pointer; white-space:nowrap;
      transition:all .25s; box-shadow:0 4px 20px rgba(139,92,246,.3);
      font-family:'DM Sans',sans-serif;
    }
    .add-btn:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(139,92,246,.45); }

    /* ── grid ── */
    .cards-grid {
      display:grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap:20px;
    }
    .card {
      background:var(--surface); border:1px solid var(--border);
      border-radius:20px; overflow:hidden;
      transition:all .25s; animation:fadeUp .4s ease both;
    }
    .card:hover { transform:translateY(-4px); border-color:rgba(139,92,246,.25); box-shadow:0 16px 40px rgba(0,0,0,.4); }
    .card-img { position:relative; height:200px; overflow:hidden; }
    .card-img img { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
    .card:hover .card-img img { transform:scale(1.05); }
    .card-overlay {
      position:absolute; inset:0;
      background:linear-gradient(to top, rgba(7,8,15,.9) 0%, transparent 60%);
      opacity:0; transition:opacity .3s;
    }
    .card:hover .card-overlay { opacity:1; }
    .card-actions {
      position:absolute; bottom:14px; right:14px;
      display:flex; gap:8px;
      opacity:0; transform:translateY(6px);
      transition:all .3s;
    }
    .card:hover .card-actions { opacity:1; transform:translateY(0); }
    .icon-btn {
      width:36px; height:36px; border-radius:10px;
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; border:none; transition:all .2s;
    }
    .icon-btn.edit { background:rgba(139,92,246,.25); color:#c4b5fd; }
    .icon-btn.edit:hover { background:rgba(139,92,246,.45); }
    .icon-btn.del { background:rgba(239,68,68,.2); color:#fca5a5; }
    .icon-btn.del:hover { background:rgba(239,68,68,.4); }
    .card-body { padding:16px; }
    .card-title { font-family:'Syne',sans-serif; font-weight:700; font-size:1rem; margin-bottom:6px; }
    .card-prompt { font-size:.78rem; color:var(--muted); margin-bottom:12px; line-height:1.5; }
    .card-tags { display:flex; flex-wrap:wrap; gap:6px; }

    /* ── empty ── */
    .empty { text-align:center; padding:80px 20px; color:var(--muted); }
    .empty svg { opacity:.3; margin-bottom:16px; }
    .empty h3 { font-family:'Syne',sans-serif; font-size:1.25rem; font-weight:800; color:var(--text); margin-bottom:8px; }

    /* ── loader ── */
    .loader { display:flex; flex-direction:column; align-items:center; padding:80px 20px; gap:16px; color:var(--muted); }
    .spin { animation:spin 1s linear infinite; color:var(--accent); }

    /* ── MODAL ── */
    .modal-overlay {
      position:fixed; inset:0; z-index:1000;
      background:rgba(0,0,0,.7); backdrop-filter:blur(12px);
      display:flex; align-items:center; justify-content:center;
      padding:16px;
    }
    .modal {
      background:#0e1018; border:1px solid rgba(255,255,255,.1);
      border-radius:24px; width:100%; max-width:560px;
      max-height:90vh; overflow-y:auto;
      box-shadow:0 40px 80px rgba(0,0,0,.6);
      animation:modalIn .3s ease;
      scrollbar-width:thin; scrollbar-color:rgba(139,92,246,.3) transparent;
    }
    .modal::-webkit-scrollbar { width:6px; }
    .modal::-webkit-scrollbar-thumb { background:rgba(139,92,246,.3); border-radius:99px; }
    .modal-header {
      display:flex; align-items:center; justify-content:space-between;
      padding:24px 28px 0;
    }
    .modal-title { font-family:'Syne',sans-serif; font-weight:800; font-size:1.3rem; letter-spacing:-.03em; }
    .modal-close {
      width:36px; height:36px; border-radius:10px;
      background:var(--surface); border:1px solid var(--border);
      color:var(--muted); cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:all .2s;
    }
    .modal-close:hover { color:var(--text); background:var(--surface-hover); }
    .modal-body { padding:24px 28px; display:flex; flex-direction:column; gap:20px; }
    .field-label {
      display:block; font-size:.7rem; font-weight:700;
      text-transform:uppercase; letter-spacing:.1em;
      color:var(--muted); margin-bottom:8px;
    }
    .field-input, .field-textarea {
      width:100%; background:rgba(255,255,255,.04);
      border:1px solid var(--border); border-radius:14px;
      color:var(--text); padding:13px 16px;
      font-size:.9rem; font-family:'DM Sans',sans-serif;
      outline:none; transition:border-color .2s;
    }
    .field-input:focus, .field-textarea:focus { border-color:var(--border-bright); }
    .field-input::placeholder, .field-textarea::placeholder { color:var(--muted); }
    .field-textarea { resize:vertical; min-height:100px; line-height:1.6; }

    /* drop zone */
    .drop-zone {
      border:2px dashed var(--border); border-radius:16px;
      padding:32px 20px; text-align:center; cursor:pointer;
      transition:all .25s; position:relative; overflow:hidden;
    }
    .drop-zone:hover, .drop-zone.over {
      border-color:var(--border-bright);
      background:rgba(139,92,246,.06);
    }
    .drop-zone .dz-icon {
      width:52px; height:52px; border-radius:14px;
      background:rgba(139,92,246,.15); color:var(--accent);
      display:flex; align-items:center; justify-content:center;
      margin:0 auto 12px;
    }
    .drop-zone .dz-main { font-weight:700; font-size:.9rem; margin-bottom:4px; }
    .drop-zone .dz-sub { font-size:.75rem; color:var(--muted); }
    .preview-wrap { position:relative; border-radius:14px; overflow:hidden; }
    .preview-wrap img { width:100%; display:block; max-height:240px; object-fit:cover; }
    .preview-remove {
      position:absolute; top:10px; right:10px;
      width:32px; height:32px; border-radius:8px;
      background:rgba(7,8,15,.8); border:1px solid rgba(255,255,255,.15);
      color:#fff; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:all .2s;
    }
    .preview-remove:hover { background:rgba(239,68,68,.7); }
    .url-row {
      display:flex; align-items:center; gap:10px;
      background:rgba(255,255,255,.03); border:1px solid var(--border);
      border-radius:12px; padding:10px 14px; margin-top:10px;
    }
    .url-row input {
      flex:1; background:none; border:none; outline:none;
      color:var(--text); font-size:.82rem;
      font-family:'DM Sans',sans-serif;
    }
    .url-row input::placeholder { color:var(--muted); }

    /* modal footer */
    .modal-footer {
      display:flex; gap:12px;
      padding:0 28px 28px;
    }
    .btn-abort {
      flex:1; padding:14px; border-radius:14px;
      background:var(--surface); border:1px solid var(--border);
      color:var(--muted); font-weight:700; font-size:.875rem;
      cursor:pointer; transition:all .2s;
      font-family:'DM Sans',sans-serif;
    }
    .btn-abort:hover { color:var(--text); background:var(--surface-hover); }
    .btn-save {
      flex:2; padding:14px; border-radius:14px;
      background:linear-gradient(135deg,#8b5cf6,#6d28d9);
      color:#fff; font-weight:800; font-size:.875rem;
      cursor:pointer; border:none; transition:all .25s;
      display:flex; align-items:center; justify-content:center; gap:8px;
      font-family:'DM Sans',sans-serif;
      box-shadow:0 4px 20px rgba(139,92,246,.3);
    }
    .btn-save:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 28px rgba(139,92,246,.45); }
    .btn-save:disabled { opacity:.6; cursor:not-allowed; }

    /* error banner */
    .err-banner {
      display:flex; align-items:center; justify-content:space-between;
      padding:12px 18px; border-radius:14px;
      background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.25);
      color:#f87171; font-size:.85rem; font-weight:600; margin-bottom:20px;
    }
    .err-banner button {
      background:none; border:none; color:#f87171; cursor:pointer; font-size:1.1rem;
    }

    /* ── responsive ── */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }
      .sidebar.open {
        transform: translateX(0);
        box-shadow: 20px 0 60px rgba(0,0,0,.8);
      }
      .admin-main { margin-left: 0; }
      .hamburger { display:flex; }
      .content-area { padding: 20px 16px; }
      .top-bar { padding: 12px 16px; }
      .search-box { max-width:none; flex:1; }
      .user-name { display:none; }
      .cards-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction:column; align-items:stretch; }
      .add-btn { justify-content:center; }
    }
    @media (max-width: 480px) {
      .modal { border-radius: 20px 20px 0 0; max-height:92vh; }
      .modal-overlay { align-items:flex-end; padding:0; }
      .modal-header, .modal-body { padding-left:20px; padding-right:20px; }
      .modal-footer { padding:0 20px 28px; }
    }
    .overlay-bg {
      position:fixed; inset:0; z-index:99; background:rgba(0,0,0,.5);
      display:none;
    }
    .overlay-bg.show { display:block; }
  `;

  return (
    <>
      <style>{css}</style>
      <Toast msg={toast} />

      <div className="admin-layout">
        {/* mobile overlay */}
        <div className={`overlay-bg ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* ── Sidebar ── */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-brand">
            <LayoutGrid size={20} />
            <span>Prompt Core</span>
            <div className="dot" style={{ marginLeft: 'auto' }} />
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
              <LayoutGrid size={18} /><span>Collections</span>
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
              <User size={18} /><span>Users</span>
            </NavLink>
            <NavLink to="/admin/profile" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
              <User size={18} /><span>Profile</span>
            </NavLink>
          </nav>
          <div className="sidebar-footer">
            <button onClick={adminLogout} className="logout-btn">
              <LogOut size={18} /><span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="admin-main">
          {/* Top bar */}
          <header className="top-bar">
            <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
              <Menu size={20} />
            </button>
            <div className="search-box">
              <Search size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search collections…"
              />
            </div>
            <Link to="/admin/profile" className="user-chip" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ textAlign: 'right' }}>
                <div className="user-name" style={{ fontSize: '.8rem', fontWeight: 700 }}>{admin?.username}</div>
                <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>Admin</div>
              </div>
              <div className="user-avatar"><User size={18} /></div>
            </Link>
          </header>

          {/* Content */}
          <div className="content-area">
            <div className="page-header">
              <div>
                <h2 className="page-title">Gallery Collections</h2>
                <p className="page-sub">{categories.length} prompts · {filtered.length} shown</p>
              </div>
              <button className="add-btn" onClick={() => { setEditingCategory(null); setFormData({ title: '', imageUrl: '', prompt: '', tags: '' }); setFilePreview(null); setSelectedFile(null); setIsModalOpen(true); }}>
                <Plus size={18} /><span>Add Prompt</span>
              </button>
            </div>

            {error && (
              <div className="err-banner">
                <span><AlertCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />{error}</span>
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}

            {loading ? (
              <div className="loader">
                <Loader2 size={40} className="spin" />
                <p>Loading collections…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                <Search size={48} />
                <h3>Nothing found</h3>
                <p>Try a different search or add a new prompt.</p>
              </div>
            ) : (
              <div className="cards-grid">
                {filtered.map((cat, i) => (
                  <div key={cat.id} className="card" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="card-img">
                      <img src={cat.imageUrl} alt={cat.title} loading="lazy" />
                      <div className="card-overlay" />
                      <div className="card-actions">
                        <button className="icon-btn edit" onClick={() => handleEdit(cat)}><Edit2 size={15} /></button>
                        <button className="icon-btn del" onClick={() => handleDelete(cat.id)}><Trash2 size={15} /></button>
                      </div>
                    </div>
                    <div className="card-body">
                      <p className="card-title">{cat.title}</p>
                      <p className="card-prompt">{cat.prompt?.substring(0, 70)}…</p>
                      <div className="card-tags">
                        {(Array.isArray(cat.tags) ? cat.tags : []).slice(0, 3).map((t, j) => <Tag_ key={j} label={t} />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingCategory ? 'Edit Record' : 'New Gallery Prompt'}
              </h2>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Title */}
                <div>
                  <label className="field-label">Gallery Title</label>
                  <input
                    className="field-input"
                    name="title" required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Cyberpunk Aesthetics"
                  />
                </div>

                {/* Image upload */}
                <div>
                  <label className="field-label">Cover Image</label>
                  {(filePreview || formData.imageUrl) ? (
                    <div className="preview-wrap">
                      <img src={filePreview || formData.imageUrl} alt="preview" />
                      <button
                        type="button" className="preview-remove"
                        onClick={() => { setSelectedFile(null); setFilePreview(null); setFormData({ ...formData, imageUrl: '' }); }}
                      ><X size={14} /></button>
                    </div>
                  ) : (
                    <div
                      className={`drop-zone ${dragOver ? 'over' : ''}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      <input type="file" id="file-upload" hidden accept="image/*"
                        onChange={e => handleFileChange(e.target.files[0])} />
                      <div className="dz-icon"><UploadCloud size={24} /></div>
                      <p className="dz-main">Drop image here or click to browse</p>
                      <p className="dz-sub">PNG, JPG, WebP — max 10 MB</p>
                    </div>
                  )}
                  <div className="url-row">
                    <FileText size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <input
                      value={selectedFile ? selectedFile.name : formData.imageUrl}
                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="Or paste external image URL"
                    />
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <label className="field-label">Prompt Configuration</label>
                  <textarea
                    className="field-textarea"
                    name="prompt" required
                    value={formData.prompt}
                    onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                    placeholder="Cinematic, long shot, high detail, golden hour…"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="field-label">
                    <Tag size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                    Identity Tags (comma separated)
                  </label>
                  <input
                    className="field-input"
                    name="tags"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="#cyberpunk, #neon, #aesthetic"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-abort" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-save" disabled={isUploading}>
                  {isUploading
                    ? <><Loader2 size={17} className="spin" /><span>Processing…</span></>
                    : <><Save size={17} /><span>{editingCategory ? 'Save Changes' : 'Create Prompt'}</span></>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPanel;