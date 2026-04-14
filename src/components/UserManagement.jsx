import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, Plus, Search, Trash2, Edit2, ArrowRight, Activity, 
    ShieldAlert, CheckCircle, RefreshCcw, LayoutGrid, User, LogOut, Cpu,
    Home, Settings, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import config from '../url/config';

const UserManagement = () => {
    const { adminToken, adminLogout, admin } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${config.API_BASE_URL}/auth/users`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            setUsers(res.data);
        } catch (err) {
            setError('System link failed. Redirecting...');
            if (err.response?.status === 401 || err.response?.status === 403) {
                setTimeout(() => navigate('/admin/login'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await axios.post(`${config.API_BASE_URL}/auth/register`, {
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                role: formData.role
            });
            setFormData({ username: '', email: '', password: '', role: 'user' });
            setSuccess('Protocol established successfully.');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        }
    };

    const toggleStatus = async (mongoId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'pending' : 'active';
        try {
            await axios.patch(`${config.API_BASE_URL}/auth/users/${mongoId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            fetchData();
        } catch (err) {
            setError('Status update failed.');
        }
    };

    const toggleRole = async (mongoId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await axios.patch(`${config.API_BASE_URL}/auth/users/${mongoId}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            fetchData();
        } catch (err) {
            setError('Role update failed.');
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Erase this identity from the core?')) return;
        try {
            await axios.delete(`${config.API_BASE_URL}/auth/users/${id}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            setSuccess('Indentity purged.');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erase protocol failed.');
        }
    };

    const handleLogout = () => {
        adminLogout();
        navigate('/admin/login');
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

        .layout { display: flex; min-height: 100vh; }
        .noise { position: fixed; inset: 0; background: url("https://grainy-gradients.vercel.app/noise.svg"); opacity: 0.04; pointer-events: none; z-index: 9999; mix-blend-mode: overlay; }

        .mobile-dock {
            display: none; position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
            background: rgba(15, 15, 18, 0.8); backdrop-filter: blur(24px);
            border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; padding: 8px; z-index: 2000; gap: 8px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .dock-item { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); text-decoration: none; transition: 0.3s; }
        .dock-item.active { background: #fff; color: #000; }

        .sidebar {
            width: var(--sidebar-w); background: var(--panel); border-right: 1px solid var(--border);
            display: flex; flex-direction: column; position: fixed; height: 100vh; left: 0; top: 0; z-index: 1000;
        }
        .sidebar-head { padding: 32px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; cursor: Pointer; text-decoration: none; color: #fff; }
        .sys-logo { width: 32px; height: 32px; background: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #000; }
        .sys-name { font-weight: 900; font-size: 1.1rem; letter-spacing: -0.05em; }

        .sidebar-nav { padding: 24px 12px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .nav-btn { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; color: var(--text-muted); text-decoration: none; font-size: 0.85rem; font-weight: 700; transition: 0.3s; }
        .nav-btn:hover { color: #fff; background: var(--surface); }
        .nav-btn.active { color: #fff; background: rgba(255,255,255,0.06); border: 1px solid var(--border); }

        .main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; width: 100%; transition: margin 0.3s var(--easing); }
        .top-bar { height: 80px; padding: 0 40px; border-bottom: 1px solid var(--border); background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
        .search-box { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 100px; padding: 8px 16px; display: flex; align-items: center; gap: 10px; width: 100%; max-width: 300px; }

        .content { padding: 60px 40px; width: 100%; max-width: 1400px; margin: 0 auto; }
        .page-header { margin-bottom: 60px; }
        .page-title { font-size: clamp(2.2rem, 8vw, 4rem); font-weight: 950; letter-spacing: -0.06em; line-height: 1; margin-bottom: 12px; }
        .page-desc { color: var(--text-muted); font-size: 1rem; font-weight: 500; }

        .dashboard-grid { display: grid; grid-template-columns: 1fr 2.5fr; gap: 40px; }
        .form-card { background: var(--panel); border: 1px solid var(--border); border-radius: 32px; padding: 40px; position: sticky; top: 120px; }
        
        .btn-init { width: 100%; padding: 16px; border-radius: 100px; background: #fff; color: #000; font-weight: 950; border: none; cursor: Pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
        .btn-init:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(255,255,255,0.2); }

        .table-card { background: var(--panel); border: 1px solid var(--border); border-radius:32px; padding: 32px; overflow: hidden; }
        .table-wrap { width: 100%; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 16px; font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border); }
        td { padding: 20px 16px; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
        
        .role-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 900; cursor: pointer; transition: 0.2s; }
        .role-admin { background: #fff; color: #000; }
        .role-user { background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid var(--border); }

        .status-pill { padding: 4px 12px; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; cursor: pointer; width: fit-content; }
        .status-active { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
        .status-pending { background: rgba(251, 191, 36, 0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }

        .act-btn { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.02); border: 1px solid var(--border); color: var(--text-muted); transition: 0.2s; cursor: pointer; }
        .act-btn:hover { background: #fff; color: #000; border-color: #fff; }

        @media (max-width: 1024px) { .sidebar { display: none; } .mobile-dock { display: flex; } .main { margin-left: 0; padding-bottom: 120px; } .top-bar { padding: 0 20px; } .dashboard-grid { grid-template-columns: 1fr; } .form-card { position: static; margin-bottom: 30px; } .table-head { flex-direction: column; align-items: flex-start; gap: 20px; } }
    `;

    return (
        <div className="layout">
            <style>{css}</style>
            <div className="noise" />

            {/* Mobile Dock */}
            <div className="mobile-dock">
                <NavLink to="/admin" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}><LayoutGrid size={22} /></NavLink>
                <NavLink to="/users" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}><Users size={22} /></NavLink>
                <NavLink to="/admin/profile" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}><User size={22} /></NavLink>
                <button onClick={handleLogout} className="dock-item" style={{ background: 'none', border: 'none' }}><LogOut size={22} color="#ef4444" /></button>
            </div>

            <aside className="sidebar">
                <Link to="/" className="sidebar-head">
                    <div className="sys-logo"><Cpu size={18} /></div>
                    <span className="sys-name">BANANA <span style={{ opacity: 0.4 }}>CORE</span></span>
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
                    <div className="search-box">
                        <Search size={16} color="var(--text-muted)" />
                        <input 
                            type="text" 
                            placeholder="Find node handle..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.8rem', outline: 'none' }} 
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                </header>

                <div className="content">
                    <div className="page-header">
                        <h1 className="page-title">Identity Directory</h1>
                        <p className="page-desc">System access control and endpoint management.</p>
                    </div>

                    <div className="dashboard-grid">
                        <div className="form-card">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 950, marginBottom: '32px' }}>Initialize Node</h3>
                            <form onSubmit={handleCreate}>
                                <div className="f-field"><label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Identity Alias</label><input style={{ width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '14px', color: '#fff', fontSize: '0.95rem', marginBottom: '18px', outline: 'none' }} type="text" placeholder="username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required /></div>
                                <div className="f-field"><label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Endpoint Mail</label><input style={{ width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '14px', color: '#fff', fontSize: '0.95rem', marginBottom: '18px', outline: 'none' }} type="email" placeholder="mail@system.io" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
                                <div className="f-field"><label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Secret Cipher</label><input style={{ width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '14px', color: '#fff', fontSize: '0.95rem', marginBottom: '18px', outline: 'none' }} type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required /></div>
                                <div className="f-field"><label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Access Level</label><select style={{ width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '14px', color: '#fff', fontSize: '0.95rem', marginBottom: '18px', outline: 'none', appearance: 'none' }} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}><option value="user" style={{ background: '#0a0a0c' }}>Standard User</option><option value="admin" style={{ background: '#0a0a0c' }}>Administrator</option></select></div>
                                <button type="submit" className="btn-init"><span>Deploy Node</span><ArrowRight size={18} /></button>
                            </form>
                            {(success || error) && <div style={{ marginTop: '20px', color: success ? '#4ade80' : '#f87171', fontSize: '0.8rem', fontWeight: 700 }}>{success || error}</div>}
                        </div>

                        <div className="table-card">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 950, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}><Activity size={20} /><span>Registry Status</span></h3>
                            <div className="table-wrap">
                                <table>
                                    <thead><tr><th>Alias</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} className="tr-row">
                                                <td><div style={{ fontWeight: 800, fontSize: '1rem' }}>{u.username}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div></td>
                                                <td><div className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}`} onClick={() => toggleRole(u.mongoId || u.id, u.role)}>{u.role === 'admin' ? 'ADMIN' : 'USER'}</div></td>
                                                <td><div className={`status-pill ${u.status === 'active' ? 'status-active' : 'status-pending'}`} onClick={() => toggleStatus(u.mongoId || u.id, u.status)}>{u.status}</div></td>
                                                <td><button className="act-btn" onClick={() => deleteUser(u.mongoId || u.id)}><Trash2 size={16} /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserManagement;
