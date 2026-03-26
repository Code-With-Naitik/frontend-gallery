import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Plus, LogOut, Home, Compass, ShieldCheck, ExternalLink, Search, Trash2, Edit3, CheckCircle, Clock } from 'lucide-react';
import config from '../url/config';

const UserManagement = () => {
    const { admin, adminToken, adminLogout } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [stats, setStats] = useState({ users: 0 });

    const fetchData = async () => {
        if (!adminToken) return;
        setLoading(true);
        setError('');
        try {
            const uRes = await axios.get(`${config.API_BASE_URL}/auth/users`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            setUsers(uRes.data);
            setStats({ users: uRes.data.length });
        } catch (err) {
            setError('Identity synchronization failed. Re-authentication required.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [adminToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
            setError('Please fill all fields.');
            return;
        }

        try {
            await axios.post(`${config.API_BASE_URL}/auth/register`, {
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            });
            setFormData({ username: '', email: '', password: '' });
            setSuccess('User registered successfully.');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Create user failed.');
        }
    };

    const handleDelete = async (mongoId) => {
        if (!window.confirm('Are you sure you want to terminate this user protocol?')) return;
        try {
            await axios.delete(`${config.API_BASE_URL}/auth/users/${mongoId}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            setSuccess('User protocol successfully terminated.');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Deletion failed.');
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
            setError('Failed to update status protocol.');
        }
    };

    const loginAsUser = (email) => {
        navigate('/login', { state: { email } });
    };

    const sidebarCss = `
        .sidebar { width: 260px; background: #09090b; border-right: 1px solid rgba(255,255,255,.05); display: flex; flex-direction: column; height: 100vh; position: sticky; top: 0; }
        .sidebar-brand { height: 72px; padding: 0 24px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255,255,255,.05); color: #fff; font-weight: 800; font-size: 1.05rem; }
        .sidebar-nav { flex: 1; padding: 24px 12px; display: flex; flex-direction: column; gap: 4px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; text-decoration: none; color: #71717a; font-size: 0.875rem; font-weight: 600; transition: all .2s; cursor: pointer; border: none; background: none; width: 100%; text-align: left; }
        .nav-item:hover { background: rgba(255,255,255,.05); color: #fff; }
        .nav-item.active { background: rgba(139,92,246,.1); color: #8b5cf6; }
        .logout-btn { margin: 12px; padding: 12px 16px; border-radius: 12px; background: rgba(239,68,68,.08); color: #ef4444; border: none; cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 14px; transition: .2s; }
        .logout-btn:hover { background: rgba(239,68,68,.15); }
    `;

    return (
        <div style={{ background: '#05060b', minHeight: '100vh', color: '#e2e8f0', display: 'flex' }}>
            <style>{sidebarCss}</style>
            
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <Home size={20} />
                    <span>Prompt Core</span>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', marginLeft: 'auto', boxShadow: '0 0 10px #8b5cf6' }} />
                </div>

                <nav className="sidebar-nav">
                    <button onClick={() => navigate('/admin')} className="nav-item">
                        <Compass size={18} /><span>Collections</span>
                    </button>
                    <button className="nav-item active">
                        <User size={18} /><span>Users</span>
                    </button>
                    <button onClick={() => navigate('/admin/profile')} className="nav-item">
                        <ShieldCheck size={18} /><span>Profile</span>
                    </button>
                </nav>

                <button onClick={() => { adminLogout(); navigate('/admin/login'); }} className="logout-btn">
                    <LogOut size={16} /> Logout
                </button>
            </aside>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header style={{
                    height: 72, borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', padding: '0 2.5rem',
                    background: 'rgba(5,6,11,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10
                }}>
                    <div style={{ padding: '0 0.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                        ADMINISTRATOR ACCESS GRANTED
                    </div>
                </header>

                <div style={{ padding: '2.5rem 3rem', flex: 1 }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h1 style={{ 
                            fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '2.4rem', fontWeight: 900, 
                            letterSpacing: '-0.02em', color: '#fff', margin: 0 
                        }}>
                            User Management
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            {stats.users} active user protocols established in the database.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
                        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '2rem', background: 'rgba(30,41,59,0.2)' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 700 }}>Onboard New Client</h2>
                                <p style={{ color: '#94a3b8', marginTop: '0.4rem', fontSize: '0.9rem' }}>Create a standard user account for the gallery ecosystem.</p>
                            </div>

                            {(error || success) && (
                                <div style={{ marginBottom: '1.5rem', padding: '0.9rem 1.25rem', borderRadius: 14, background: error ? 'rgba(239,68,68,.1)' : 'rgba(34,197,94,.1)', border: `1px solid ${error ? 'rgba(239,68,68,.2)' : 'rgba(34,197,94,.2)'}` }}>
                                    <span style={{ color: error ? '#f87171' : '#4ade80', fontWeight: 600, fontSize: '0.9rem' }}>{error || success}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1.25rem', alignItems: 'end' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.6rem', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="User alias"
                                        style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,.08)', background: '#0a0b12', color: '#fff', padding: '0.85rem 1.1rem', outline: 'none' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.6rem', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Secure</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@domain.com"
                                        style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,.08)', background: '#0a0b12', color: '#fff', padding: '0.85rem 1.1rem', outline: 'none' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.6rem', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Initial Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Security credentials"
                                        style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,.08)', background: '#0a0b12', color: '#fff', padding: '0.85rem 1.1rem', outline: 'none' }}
                                        required
                                    />
                                </div>
                                <button type="submit" style={{ borderRadius: 12, border: 'none', background: '#fff', color: '#000', fontWeight: 800, padding: '0.85rem 1.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: '0.3s' }}>
                                    <Plus size={18} /> Create Account
                                </button>
                            </form>
                        </div>

                        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '2rem', background: 'rgba(30,41,59,0.1)', backdropFilter: 'blur(10px)' }}>
                            <h3 style={{ color: '#fff', marginTop: 0, fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 700 }}>Account Directory</h3>
                            {loading ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Establishing secure connection...</div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '1.2rem 1rem', borderBottom: '1px solid rgba(255,255,255,.06)', color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>Protocol ID</th>
                                                <th style={{ textAlign: 'left', padding: '1.2rem 1rem', borderBottom: '1px solid rgba(255,255,255,.06)', color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>Alias</th>
                                                <th style={{ textAlign: 'left', padding: '1.2rem 1rem', borderBottom: '1px solid rgba(255,255,255,.06)', color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>Identity Email</th>
                                                <th style={{ textAlign: 'center', padding: '1.2rem 1rem', borderBottom: '1px solid rgba(255,255,255,.06)', color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>Status</th>
                                                <th style={{ textAlign: 'center', padding: '1.2rem 1rem', borderBottom: '1px solid rgba(255,255,255,.06)', color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>Control Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length ? users.map((u) => (
                                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)', transition: '0.2s' }}>
                                                    <td style={{ padding: '1.2rem 1rem', color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace' }}>#{String(u.id).padStart(4, '0')}</td>
                                                    <td style={{ padding: '1.2rem 1rem', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{u.username}</td>
                                                    <td style={{ padding: '1.2rem 1rem', color: '#94a3b8', fontSize: '0.9rem' }}>{u.email}</td>
                                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                        <div 
                                                            onClick={() => toggleStatus(u.mongoId, u.status)}
                                                            style={{ 
                                                                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, 
                                                                fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
                                                                background: u.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                                                                color: u.status === 'active' ? '#4ade80' : '#fbbf24',
                                                                border: `1px solid ${u.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
                                                                transition: '0.3s'
                                                            }}
                                                        >
                                                            {u.status === 'active' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                            {u.status}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                                            <button 
                                                                onClick={() => loginAsUser(u.email)} 
                                                                title="Edit Profile"
                                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8, cursor: 'pointer', padding: '0.5rem', display: 'flex', transition: '0.2s' }}
                                                            >
                                                                <Edit3 size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(u.mongoId)} 
                                                                title="Delete User"
                                                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 8, cursor: 'pointer', padding: '0.5rem', display: 'flex', transition: '0.2s' }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>No user records found in current sector.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserManagement;
