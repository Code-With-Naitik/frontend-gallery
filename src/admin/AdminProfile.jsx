import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import {
    LayoutGrid, User, LogOut, ShieldCheck, Mail, Calendar,
    Shield, ArrowLeft, Edit3, Camera, Menu, Rocket, Search,
    ChevronRight, Zap, ShieldAlert, Cpu, Users, Home, Settings,
    UploadCloud, Loader2
} from 'lucide-react';
import axios from 'axios';
import config from '../url/config';

const AdminProfile = () => {
    const { admin, adminToken, adminLogout, adminLogin } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editUsername, setEditUsername] = useState(admin?.username || '');
    const [editEmail, setEditEmail] = useState(admin?.email || '');
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (admin) {
            setEditUsername(admin.username || '');
            setEditEmail(admin.email || '');
        }
    }, [admin]);

    const handleUpdate = async (newProfilePic = null) => {
        setLoading(true);
        setStatusMsg({ type: '', text: '' });
        try {
            const payload = {
                username: editUsername.trim(),
                email: editEmail.trim().toLowerCase()
            };
            if (newProfilePic) {
                payload.profilePic = newProfilePic;
            } else if (admin?.profilePic) {
                payload.profilePic = admin.profilePic;
            }

            const res = await axios.put(
                `${config.API_BASE_URL}/auth/admin`,
                payload,
                { headers: { Authorization: `Bearer ${adminToken}` } }
            );

            adminLogin(adminToken, res.data);
            setIsEditing(false);
            setStatusMsg({ type: 'success', text: 'Identity protocol synchronized.' });
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
        } catch (err) {
            setStatusMsg({ type: 'error', text: err.response?.data?.error || 'Sync failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const fd = new FormData();
        fd.append('image', file);

        try {
            const res = await axios.post(`${config.API_BASE_URL}/api/upload`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await handleUpdate(res.data.imageUrl);
        } catch (err) {
            setStatusMsg({ type: 'error', text: 'Visual data upload failed.' });
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        adminLogout();
        navigate('/admin/login');
    };

    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        :root {
            --bg: #000;
            --panel: #0a0a0c;
            --surface: rgba(255, 255, 255, 0.03);
            --border: rgba(255, 255, 255, 0.08);
            --accent: #fff;
            --text-muted: rgba(255, 255, 255, 0.4);
            --sidebar-w: 260px;
            --easing: cubic-bezier(0.16, 1, 0.3, 1);
        }

        body {
            font-family: 'Cabinet Grotesk', sans-serif;
            background: var(--bg); color: #fff;
            -webkit-font-smoothing: antialiased; overflow-x: hidden;
        }

        .admin-layout { display: flex; min-height: 100vh; }
        .noise { position: fixed; inset: 0; background: url("https://grainy-gradients.vercel.app/noise.svg"); opacity: 0.04; pointer-events: none; z-index: 9999; mix-blend-mode: overlay; }

        .mobile-dock {
            display: none; position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
            background: rgba(15, 15, 18, 0.8); backdrop-filter: blur(24px);
            border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; padding: 8px; z-index: 2000; gap: 8px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .dock-item { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); text-decoration: none; transition: 0.3s; }
        .dock-item.active { background: #fff; color: #000; }

        .sidebar { width: var(--sidebar-w); background: var(--panel); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; height: 100vh; left: 0; top: 0; z-index: 1000; }
        .sidebar-head { padding: 32px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; cursor: pointer; text-decoration: none; color: #fff; }
        .sys-logo { width: 32px; height: 32px; background: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #000; }
        .sys-name { font-weight: 950; font-size: 1.1rem; letter-spacing: -0.05em; }

        .sidebar-nav { padding: 24px 12px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .nav-btn { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; color: var(--text-muted); text-decoration: none; font-size: 0.85rem; font-weight: 700; transition: 0.3s; }
        .nav-btn:hover { color: #fff; background: var(--surface); }
        .nav-btn.active { color: #fff; background: rgba(255,255,255,0.06); border: 1px solid var(--border); }

        .main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; width: 100%; }
        .top-bar { height: 80px; padding: 0 40px; border-bottom: 1px solid var(--border); background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }

        .content { padding: 80px 40px; width: 100%; max-width: 1400px; margin: 0 auto; }
        .p-hero { margin-bottom: 60px; }
        .p-title { font-size: clamp(2.5rem, 8vw, 4rem); font-weight: 950; letter-spacing: -0.06em; line-height: 1; margin-bottom: 12px; }
        
        .profile-stack { display: grid; grid-template-columns: 360px 1fr; gap: 40px; align-items: start; }
        
        .card-p { background: #0a0a0c; border: 1px solid var(--border); border-radius: 48px; padding: 48px 32px; text-align: center; }
        .avatar-box { width: 180px; height: 180px; margin: 0 auto 32px; position: relative; }
        .avatar-img-wrap { width: 100%; height: 100%; border-radius: 42%; overflow: hidden; background: #fff; display: flex; align-items: center; justify-content: center; transform: rotate(-3deg); box-shadow: 0 40px 80px rgba(0,0,0,0.7); border: 6px solid #fff; transition: 0.5s var(--easing); }
        .avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .cam-trigger { position: absolute; bottom: 0; right: 0; width: 52px; height: 52px; background: #fff; border: 4px solid #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000; cursor: pointer; transition: 0.3s; z-index: 20; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .cam-trigger:hover { transform: scale(1.1) rotate(15deg); }

        .p-name { font-size: 2.25rem; font-weight: 950; margin-bottom: 8px; letter-spacing: -0.04em; }
        .role-tag { display: inline-block; padding: 6px 16px; background: rgba(255,255,255,0.05); border-radius: 100px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); }

        .info-pane { background: #0a0a0c; border: 1px solid var(--border); border-radius: 48px; padding: 48px; height: 100%; }
        .pane-title { font-size: 1.5rem; font-weight: 950; margin-bottom: 40px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid var(--border); padding-bottom: 24px; }
        
        .inf-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .inf-item { padding: 32px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 32px; display: flex; align-items: center; gap: 20px; transition: 0.3s; }
        .inf-item:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); }
        
        .inf-icon { width: 54px; height: 54px; border-radius: 16px; background: #fff; color: #000; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .inf-lbl { font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em; }
        .inf-val { font-size: 1.1rem; font-weight: 700; word-break: break-all; color: #fff; }

        .f-label { font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px; display: block; }
        .f-control { width: 100%; padding: 18px 24px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 20px; color: #fff; font-family: inherit; font-size: 1rem; outline: none; margin-bottom: 20px; transition: 0.2s; }
        .f-control:focus { border-color: #fff; background: rgba(255,255,255,0.05); }
        
        .btn-p { width: 100%; padding: 18px; border-radius: 100px; background: #fff; color: #000; font-weight: 900; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: 0.3s; font-size: 0.95rem; }
        .btn-p:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }

        @media (max-width: 1200px) { .profile-stack { grid-template-columns: 1fr; } .inf-grid { grid-template-columns: 1fr; } }
        @media (max-width: 1024px) { .sidebar { display: none; } .mobile-dock { display: flex; } .main { margin-left: 0; padding-bottom: 120px; } .content { padding: 40px 20px; } }
    `;

    return (
        <div className="admin-layout">
            <style>{css}</style>
            <div className="noise" />
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />

            <div className="mobile-dock">
                <NavLink to="/admin" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}><LayoutGrid size={22} /></NavLink>
                <NavLink to="/users" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}><Users size={22} /></NavLink>
                <NavLink to="/admin/profile" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}><User size={22} /></NavLink>
                <button onClick={handleLogout} className="dock-item" style={{ background: 'none', border: 'none' }}><LogOut size={22} color="#ef4444" /></button>
            </div>

            <aside className="sidebar">
                <Link to="/" className="sidebar-head">
                    <div className="sys-logo"><Cpu size={18} /></div>
                    <span className="sys-name">propy <span style={{ opacity: 0.4 }}>CORE</span></span>
                </Link>
                <nav className="sidebar-nav">
                    <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn'}><LayoutGrid size={18} /><span>Manager</span></NavLink>
                    <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn'}><Users size={18} /><span>Directory</span></NavLink>
                    <NavLink to="/admin/profile" className={({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn'}><User size={18} /><span>Profile</span></NavLink>

                    <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                        <button onClick={handleLogout} className="nav-btn" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                            <LogOut size={18} /><span>Logout</span>
                        </button>
                    </div>
                </nav>
            </aside>

            <main className="main">
                <header className="top-bar">
                    <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 900, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.05em' }}>
                        <ArrowLeft size={16} /><span>EXIT SYSTEM</span>
                    </Link>
                    <div style={{ fontWeight: 950, fontSize: '0.85rem', color: '#fff', letterSpacing: '0.15em', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '100px', border: '1px solid var(--border)' }}>ROOT_PROTO_INIT</div>
                </header>

                <div className="content">
                    <div className="p-hero">
                        <h1 className="p-title">Identity Registry</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: 500 }}>Global node configuration and visual identity.</p>
                    </div>

                    <div className="profile-stack">
                        <section className="card-p">
                            <div className="avatar-box">
                                <div className="avatar-img-wrap" style={{ transform: uploading ? 'scale(0.95)' : 'rotate(-3deg)' }}>
                                    {uploading ? (
                                        <Loader2 size={40} className="spin" color="#000" />
                                    ) : admin?.profilePic ? (
                                        <img src={admin.profilePic} alt="avatar" className="avatar-img" key={admin.profilePic} />
                                    ) : (
                                        <User size={80} color="#000" />
                                    )}
                                </div>
                                <div className="cam-trigger" onClick={() => fileInputRef.current?.click()} title="Update Visual">
                                    <Camera size={24} />
                                </div>
                            </div>
                            <h2 className="p-name">{admin?.username}</h2>
                            <div className="role-tag">LVL_0_CORE_ADMIN</div>
                            {!isEditing && <button className="btn-p" style={{ marginTop: '48px' }} onClick={() => setIsEditing(true)}><Edit3 size={18} /><span>Update Node</span></button>}
                        </section>

                        <section className="info-pane">
                            <h3 className="pane-title"><ShieldCheck size={28} /><span>Registry Metadata</span></h3>

                            {isEditing ? (
                                <div style={{ animation: 'slideUp 0.4s var(--easing)' }}>
                                    <div><label className="f-label">Identity ID</label><input className="f-control" value={editUsername} onChange={e => setEditUsername(e.target.value)} /></div>
                                    <div><label className="f-label">Registry Email</label><input className="f-control" value={editEmail} onChange={e => setEditEmail(e.target.value)} /></div>
                                    {statusMsg.text && <div style={{ marginBottom: '20px', color: statusMsg.type === 'success' ? '#4ade80' : '#f87171', fontWeight: 700, fontSize: '0.85rem' }}>{statusMsg.text}</div>}
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                                        <button className="btn-p" onClick={() => handleUpdate()} disabled={loading}>{loading ? 'Syncing...' : 'Save Config'}</button>
                                        <button className="btn-p" style={{ background: 'none', color: '#fff', border: '1px solid var(--border)' }} onClick={() => setIsEditing(false)}>Abort Change</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="inf-grid">
                                    <div className="inf-item"><div className="inf-icon"><User size={24} /></div><div><div className="inf-lbl">System Handle</div><div className="inf-val">{admin?.username}</div></div></div>
                                    <div className="inf-item"><div className="inf-icon"><Mail size={24} /></div><div><div className="inf-lbl">Registry Link</div><div className="inf-val">{admin?.email}</div></div></div>
                                    <div className="inf-item"><div className="inf-icon"><Rocket size={24} /></div><div><div className="inf-lbl">Access Layer</div><div className="inf-val">Root Authority</div></div></div>
                                    <div className="inf-item"><div className="inf-icon"><Calendar size={24} /></div><div><div className="inf-lbl">Init Date</div><div className="inf-val">{new Date(admin?.createdAt || Date.now()).toLocaleDateString()}</div></div></div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminProfile;
