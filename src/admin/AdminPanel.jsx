import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Trash2, Edit2, Plus, X, Save, Loader2, LogOut, LayoutGrid,
  User, Search, Image, UploadCloud, FileText,
  Sparkles, Tag, ChevronRight, AlertCircle, CheckCircle2, Menu,
  Zap, Calendar, Users, BarChart3, Clock, Rocket, PlusCircle, Cpu
} from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import config from '../url/config';

const API_URL = `${config.API_BASE_URL}/category`;

const AdminPanel = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ 
    title: '', imageUrl: '', prompt: '', tags: '',
    issueType: 'Task', priority: 'Medium', assignee: '', dueDate: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { admin, adminToken, adminLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchCategories(); }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: '', text: '' }), 3500);
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setCategories(response.data);
    } catch { setError('Sync error'); }
    finally { setLoading(false); }
  };

  const handleFileChange = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result);
    reader.readAsDataURL(file);
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
      if (editingCategory) await axios.put(`${API_URL}/${editingCategory._id || editingCategory.id}`, payload, cfg);
      else await axios.post(API_URL, payload, cfg);
      closeModal();
      fetchCategories();
      showToast('success', editingCategory ? 'Node updated' : 'Node initialized');
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Registry error');
    } finally { setIsUploading(false); }
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      title: cat.title, imageUrl: cat.imageUrl, prompt: cat.prompt,
      tags: Array.isArray(cat.tags) ? cat.tags.join(', ') : cat.tags || '',
      issueType: cat.issueType || 'Task',
      priority: cat.priority || 'Medium',
      assignee: cat.assignee || '',
      dueDate: cat.dueDate ? new Date(cat.dueDate).toISOString().split('T')[0] : ''
    });
    setFilePreview(null); setSelectedFile(null); setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Erase this data node?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      fetchCategories();
      showToast('success', 'Node purged');
    } catch { showToast('error', 'Purge failed'); }
  };

  const closeModal = () => {
    setIsModalOpen(false); setEditingCategory(null);
    setFormData({ title: '', imageUrl: '', prompt: '', tags: '', issueType: 'Task', priority: 'Medium', assignee: '', dueDate: '' });
    setSelectedFile(null); setFilePreview(null);
  };

  const filtered = categories.filter(c =>
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
    
    body { background: #000; color: #fff; font-family: 'Cabinet Grotesk', sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
    .noise { position: fixed; inset: 0; background: url("https://grainy-gradients.vercel.app/noise.svg"); opacity: 0.04; pointer-events: none; z-index: 9999; mix-blend-mode: overlay; }

    .admin-layout { display: flex; min-height: 100vh; }

    /* Unique Mobile Dock */
    .mobile-dock {
        display: none; position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        background: rgba(15, 15, 18, 0.8); backdrop-filter: blur(24px);
        border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; padding: 8px; z-index: 2000; gap: 8px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .dock-item { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.4); text-decoration: none; transition: 0.3s; }
    .dock-item.active { background: #fff; color: #000; }

    .sidebar { width: 260px; background: #0a0a0c; border-right: 1px solid rgba(255,255,255,0.08); position: fixed; height: 100vh; left: 0; top: 0; z-index: 1000; display: flex; flex-direction: column; }
    .sidebar-head { padding: 32px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 12px; }
    .sys-logo { width: 32px; height: 32px; background: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #000; }
    
    .sidebar-nav { padding: 24px 12px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .nav-btn { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; color: rgba(255,255,255,0.4); text-decoration: none; font-size: 0.85rem; font-weight: 700; transition: 0.3s; }
    .nav-btn:hover { color: #fff; background: rgba(255,255,255,0.03); }
    .nav-btn.active { color: #fff; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); }

    .main { margin-left: 260px; flex: 1; min-height: 100vh; }
    
    .top-bar { height: 80px; padding: 0 40px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
    .search-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; padding: 8px 16px; display: flex; align-items: center; gap: 10px; width: 320px; }

    .content { padding: 60px 40px; }
    .section-head { margin-bottom: 50px; display: flex; align-items: flex-end; justify-content: space-between; }
    .p-title { font-size: clamp(2.5rem, 8vw, 4rem); font-weight: 950; letter-spacing: -0.06em; line-height: 1; }
    
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px; }
    .card { background: #0a0a0c; border: 1px solid rgba(255,255,255,0.08); border-radius: 32px; overflow: hidden; transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    .card:hover { transform: translateY(-8px); border-color: rgba(255,255,255,0.2); }
    .card-img { width: 100%; height: 240px; object-fit: cover; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .card-body { padding: 24px; }
    
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); z-index: 9000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal-content { background: #0a0a0c; border: 1px solid rgba(255,255,255,0.1); border-radius: 40px; width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto; padding: 40px; }

    .btn-create { background: #fff; color: #000; border-radius: 100px; padding: 12px 24px; font-weight: 900; border: none; cursor: Pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
    .btn-create:hover { transform: scale(1.05); }

    @media (max-width: 1024px) {
      .sidebar { display: none; }
      .mobile-dock { display: flex; }
      .main { margin-left: 0; padding-bottom: 100px; }
      .top-bar { padding: 0 20px; height: 70px; }
      .search-box { width: 100%; max-width: 240px; }
      .content { padding: 40px 20px; }
      .grid { grid-template-columns: 1fr; }
      .section-head { flex-direction: column; align-items: flex-start; gap: 20px; }
    }
  `;

  return (
    <div className="admin-layout">
      <style>{css}</style>
      <div className="noise" />

      <div className="mobile-dock">
        <NavLink to="/admin" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}><LayoutGrid size={22} /></NavLink>
        <NavLink to="/users" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}><Users size={22} /></NavLink>
        <NavLink to="/admin/profile" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}><User size={22} /></NavLink>
        <button onClick={setIsModalOpen} className="dock-item" style={{ background: '#fff', color: '#000', marginLeft: '10px' }}><Plus size={22} /></button>
      </div>

      <aside className="sidebar">
        <Link to="/" className="sidebar-head" style={{ textDecoration: 'none', color: '#fff' }}>
          <div className="sys-logo"><Cpu size={18} /></div>
          <span style={{ fontWeight: 900 }}>BANANA CORE</span>
        </Link>
        <nav className="sidebar-nav">
          <NavLink to="/admin" className="nav-btn active"><LayoutGrid size={18} /><span>Manager</span></NavLink>
          <NavLink to="/users" className="nav-btn"><Users size={18} /><span>Directory</span></NavLink>
          <NavLink to="/admin/profile" className="nav-btn"><User size={18} /><span>Profile</span></NavLink>
          
          <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={handleLogout} className="nav-btn" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
              <LogOut size={18} /><span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      <main className="main">
        <header className="top-bar">
          <div className="search-box"><Search size={16} color="rgba(255,255,255,0.4)" /><input style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.8rem', outline: 'none' }} placeholder="Search Node..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '20px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)' }}>{admin?.username}</span>
              <NavLink to="/admin/profile" style={{ padding: '3px', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', overflow: 'hidden' }}>
                {admin?.profilePic ? (
                  <img src={admin.profilePic} alt="admin" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '28px', height: '28px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} color="#000" />
                  </div>
                )}
              </NavLink>
            </div>
            <button className="btn-create" onClick={() => setIsModalOpen(true)}><Plus size={18} /><span>Add Node</span></button>
          </div>
        </header>

        <div className="content">
          <div className="section-head">
            <div><h1 className="p-title">Data Labs</h1><p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Global registry and prompt curation.</p></div>
          </div>

          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader2 className="spin" /></div> : (
            <div className="grid">
              {filtered.map(cat => (
                <div className="card" key={cat.id}>
                  <img src={cat.imageUrl} className="card-img" />
                  <div className="card-body">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '10px' }}>{cat.title}</h3>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                      {cat.tags?.map(t => <span key={t} style={{ fontSize: '0.6rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>{t}</span>)}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={{ flex: 1, padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }} onClick={() => handleEdit(cat)}><Edit2 size={16} /></button>
                      <button style={{ padding: '10px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(cat.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 950 }}>{editingCategory ? 'Update Alpha' : 'Initialize Node'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px' }}>NODE TITLE</label><input style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
              <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px' }}>CORE PROMPT</label><textarea style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', minHeight: '120px' }} value={formData.prompt} onChange={e => setFormData({...formData, prompt: e.target.value})} required /></div>
              <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px' }}>ATTACH VISUAL</label><input type="file" onChange={e => handleFileChange(e.target.files[0])} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }} /></div>
              <button type="submit" className="btn-create" style={{ width: '100%', marginTop: '20px' }}>{isUploading ? 'Executing...' : 'Commit to Core'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;