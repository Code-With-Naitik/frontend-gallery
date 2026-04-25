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
    category: 'FASHION', modelName: 'Midjourney V6'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageSyncing, setIsImageSyncing] = useState(false);
  const [imageSynced, setImageSynced] = useState(false);

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

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error('Compression timed out')), 10000);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onerror = () => { clearTimeout(timeoutId); reject(new Error('Failed to load image')); };
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1200;

            if (width > height && width > maxDim) {
              height = Math.round(height * maxDim / width);
              width = maxDim;
            } else if (height > maxDim) {
              width = Math.round(width * maxDim / height);
              height = maxDim;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
              clearTimeout(timeoutId);
              if (!blob) { reject(new Error('Canvas blob is null')); return; }
              resolve(new File([blob], file.name || 'image.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }));
            }, 'image/jpeg', 0.75);
          } catch (e) {
            clearTimeout(timeoutId);
            reject(e);
          }
        };
      };
      reader.onerror = () => { clearTimeout(timeoutId); reject(new Error('Failed to read file')); };
    });
  };

  const handleFileChange = async (file) => {
    if (!file) return;

    // 1. Show instant local preview
    const localUrl = URL.createObjectURL(file);
    setFilePreview(localUrl);
    setIsImageSyncing(true);

    try {
      // 2. Try to compress, fall back to original if compression fails
      let fileToUpload = file;
      try {
        fileToUpload = await compressImage(file);
      } catch (compressErr) {
        console.warn('Compression skipped, using original:', compressErr.message);
      }

      // 3. Upload to server with a timeout
      const fd = new FormData();
      fd.append('image', fileToUpload);
      const res = await axios.post(`${config.API_BASE_URL}/api/upload`, fd, {
        timeout: 30000, // 30 second max
      });

      // 4. Auto-fill the IMAGE URL field
      setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
      setImageSynced(true);
      showToast('success', 'Visual asset synchronized');
    } catch (err) {
      showToast('error', 'Upload failed. Please try again.');
      setFilePreview(null);
      setImageSynced(false);
      console.error('Upload error:', err);
    } finally {
      setIsImageSyncing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      showToast('error', 'Critical Data Missing: Please attach a visual or provide an Image URL prior to committing.');
      return;
    }

    setIsUploading(true);
    try {
      const payload = {
        ...formData,
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
      category: cat.category || 'FASHION',
      modelName: cat.modelName || 'Midjourney V6'
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
    setFormData({ title: '', imageUrl: '', prompt: '', tags: '', category: 'FASHION', modelName: 'Midjourney V6' });
    setSelectedFile(null); setFilePreview(null); setImageSynced(false);
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
    
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(15px); z-index: 9000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal-content { background: linear-gradient(145deg, #111116 0%, #0a0a0c 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 32px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; padding: 40px; box-shadow: 0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1); animation: modalFade 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    
    @keyframes modalFade { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
    
    .ad-input { width: 100%; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); color: #fff; font-size: 0.95rem; outline: none; transition: all 0.3s; font-family: inherit; }
    .ad-input:focus { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.25); box-shadow: 0 0 0 4px rgba(255,255,255,0.03); }
    .ad-label { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.4); display: block; margin-bottom: 8px; letter-spacing: 0.1em; text-transform: uppercase; }
    
    .ad-file-drop { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 160px; border-radius: 16px; background: rgba(255,255,255,0.015); border: 1.5px dashed rgba(255,255,255,0.15); cursor: pointer; overflow: hidden; position: relative; transition: all 0.3s ease; }
    .ad-file-drop:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.3); }
    .ad-file-preview { width: 100%; height: 100%; object-fit: cover; }
    .ad-file-hover { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; backdrop-filter: blur(4px); }
    .ad-file-drop:hover .ad-file-hover { opacity: 1; }

    .btn-create { background: #fff; color: #000; border-radius: 100px; padding: 12px 24px; font-weight: 900; border: none; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
    .btn-create:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(255,255,255,0.15); }

    @media (max-width: 1024px) {
      .sidebar { display: none; }
      .mobile-dock { display: flex; }
      .main { margin-left: 0; padding-bottom: 100px; }
      .top-bar { padding: 0 20px; height: 70px; gap: 15px; }
      .search-box { flex: 1; max-width: none; }
      .content { padding: 30px 20px; }
      .grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
      .section-head { flex-direction: column; align-items: flex-start; gap: 12px; }
      
      .btn-create span { display: none; }
      .btn-create { padding: 12px; border-radius: 50%; aspect-ratio: 1; justify-content: center; }
      
      .admin-username { display: none; }
      .admin-profile-divider { padding-right: 12px !important; border-right: none !important; }
    }

    @media (max-width: 600px) {
      .grid { grid-template-columns: 1fr; }
      .top-bar { padding: 0 15px; gap: 10px; }
      .modal-content { padding: 24px; border-radius: 24px; max-height: 85vh; }
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
          <span style={{ fontWeight: 900 }}>propy CORE</span>
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
            <div className="admin-profile-divider" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '20px' }}>
              <span className="admin-username" style={{ fontSize: '0.75rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)' }}>{admin?.username}</span>
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
            <button className="btn-create" onClick={() => setIsModalOpen(true)}><Plus size={18} /><span>Add Prompts</span></button>
          </div>
        </header>

        <div className="content">
          <div className="section-head">
            <div><h1 className="p-title">Data Labs</h1><p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Global registry and prompt curation.</p></div>
          </div>

          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader2 className="spin" /></div> : (
            <div className="grid">
              {filtered.map(cat => (
                <div className="card" key={cat._id || cat.id}>
                  <img src={cat.imageUrl} className="card-img" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'} />
                  <div className="card-body">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '10px' }}>{cat.title}</h3>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                      {cat.tags?.map(t => <span key={t} style={{ fontSize: '0.6rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>{t}</span>)}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={{ flex: 1, padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }} onClick={() => handleEdit(cat)}><Edit2 size={16} /></button>
                      <button style={{ padding: '10px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(cat._id || cat.id)}><Trash2 size={16} /></button>
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
              <div style={{ marginBottom: '24px' }}><label className="ad-label">NODE TITLE</label><input className="ad-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g. Neon Cyberpunk City" /></div>
              <div style={{ marginBottom: '24px' }}><label className="ad-label">CORE PROMPT</label><textarea className="ad-input" style={{ minHeight: '100px', resize: 'vertical' }} value={formData.prompt} onChange={e => setFormData({ ...formData, prompt: e.target.value })} required placeholder="Describe the generated image in detail..." /></div>
              <div style={{ marginBottom: '24px' }}><label className="ad-label">IMAGE URL</label><input className="ad-input" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." readOnly={imageSynced} style={{ opacity: imageSynced ? 0.7 : 1, cursor: imageSynced ? 'default' : 'text' }} /></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label className="ad-label">CATEGORY</label>
                  <select className="ad-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    <option value="FASHION">Fashion</option>
                    <option value="CYBERPUNK">Cyberpunk</option>
                    <option value="ANIME">Anime</option>
                    <option value="NATURE">Nature</option>
                    <option value="ARCHITECTURE">Architecture</option>
                  </select>
                </div>
                <div>
                  <label className="ad-label">MODEL NAME</label>
                  <select className="ad-input" value={formData.modelName} onChange={e => setFormData({ ...formData, modelName: e.target.value })}>
                    <option value="Midjourney V6">Midjourney V6</option>
                    <option value="DALL-E 3">DALL-E 3</option>
                    <option value="Stable Diffusion">Stable Diffusion</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>OR ATTACH VISUAL</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label className="ad-file-drop">
                  <input type="file" style={{ display: 'none' }} onChange={e => handleFileChange(e.target.files[0])} accept="image/*" />
                  {filePreview ? (
                    <>
                      <img src={filePreview} className="ad-file-preview" alt="Preview" />
                      <div className="ad-file-hover" style={{ opacity: isImageSyncing ? 1 : undefined }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                          {isImageSyncing ? (
                            <>
                              <Loader2 className="spin" size={24} />
                              <span>Syncing to Core...</span>
                            </>
                          ) : imageSynced ? (
                            <>
                              <CheckCircle2 size={24} color="#22c55e" />
                              <span style={{ color: '#22c55e' }}>Synced ✓</span>
                            </>
                          ) : (
                            <>
                              <Edit2 size={16} />
                              <span>Replace Image</span>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UploadCloud size={20} color="rgba(255,255,255,0.6)" />
                      </div>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Click to browse or drop file</span>
                    </div>
                  )}
                </label>
              </div>

              <button type="submit" disabled={isImageSyncing} className="btn-create" style={{ width: '100%', padding: '16px', fontSize: '1rem', justifyContent: 'center', opacity: isImageSyncing ? 0.6 : 1, cursor: isImageSyncing ? 'not-allowed' : 'pointer' }}>
                {isUploading || isImageSyncing ? <Loader2 className="spin" size={20} /> : <Sparkles size={20} />}
                {isUploading ? 'Executing...' : isImageSyncing ? 'Syncing Image...' : 'Commit to Core'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;