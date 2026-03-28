import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Heart, Calendar, LogOut, ArrowLeft, Settings, Edit2, Check, X, Trash2, Camera, Home, Compass, ShieldCheck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import config from '../url/config';

const ProfilePage = () => {
    const { user, token, userLogout, userLogin, admin, adminToken, adminLogout, adminLogin } = useAuth();
    const navigate = useNavigate();

    // Identify active profile (prefer admin if both exist for this specific page)
    const isActiveAdmin = !!adminToken;
    const activeProfile = isActiveAdmin ? admin : user;
    const activeToken = isActiveAdmin ? adminToken : token;
    const logoutFn = isActiveAdmin ? adminLogout : userLogout;
    const loginFn = isActiveAdmin ? adminLogin : userLogin;
    const apiPath = isActiveAdmin ? '/auth/admin' : '/auth/user';
    const homePath = isActiveAdmin ? '/admin' : '/';

    const [isEditing, setIsEditing] = useState(false);
    const [editUsername, setEditUsername] = useState(activeProfile?.username || '');
    const [editEmail, setEditEmail] = useState(activeProfile?.email || '');
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    if (!activeProfile) return null;

    const handleUpdateProfile = async () => {
        const trimmedUsername = editUsername.trim();
        const trimmedEmail = editEmail.trim().toLowerCase();

        if (!trimmedUsername || !trimmedEmail) {
            setStatusMsg({ type: 'error', text: 'Username and email are required.' });
            return;
        }

        setLoading(true);
        try {
            const res = await axios.put(
                `${config.API_BASE_URL}${apiPath}`,
                { username: trimmedUsername, email: trimmedEmail },
                { headers: { Authorization: `Bearer ${activeToken}` } }
            );
            loginFn(activeToken, res.data);
            setIsEditing(false);
            setStatusMsg({ type: 'success', text: 'Profile updated successfully' });
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
        } catch (err) {
            setStatusMsg({ type: 'error', text: err.response?.data?.error || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm(`Are you sure you want to delete your ${isActiveAdmin ? 'ADMIN' : ''} account? This action cannot be undone.`)) return;
        
        const typed = window.prompt(`Please type your email (${activeProfile.email}) to confirm:`);
        if (!typed || typed.trim() !== activeProfile.email) {
            setStatusMsg({ type: 'error', text: 'Confirmation failed. Email does not match.' });
            return;
        }

        try {
            await axios.delete(`${config.API_BASE_URL}${apiPath}`, {
                headers: { Authorization: `Bearer ${activeToken}` }
            });
            logoutFn();
            navigate(isActiveAdmin ? '/admin/login' : '/login');
        } catch (err) {
            setStatusMsg({ type: 'error', text: err.response?.data?.error || 'Failed to delete account' });
        }
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
        
        @media (max-width: 1024px) {
            .sidebar { display: none; }
            .profile-main { padding: 5rem 1.5rem 2rem !important; }
            .profile-card { padding-bottom: 2rem !important; }
            .profile-name { font-size: 1.8rem !important; }
            .profile-grid { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
            .profile-info { padding: 0 1.5rem !important; }
        }
    `;

    return (
        <div style={{ 
            minHeight: '100vh', background: '#000', color: '#FFF', 
            fontFamily: "'Cabinet Grotesk', sans-serif", display: 'flex' 
        }}>
            {isActiveAdmin && <style>{sidebarCss}</style>}
            
            {isActiveAdmin && (
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
                        <button onClick={() => navigate('/users')} className="nav-item">
                            <User size={18} /><span>Users</span>
                        </button>
                        <button className="nav-item active">
                            <ShieldCheck size={18} /><span>Profile</span>
                        </button>
                    </nav>

                    <button onClick={() => { adminLogout(); navigate('/admin/login'); }} className="logout-btn">
                        <LogOut size={16} /> Logout
                    </button>
                </aside>
            )}

            {/* Main Content */}
            <div className="profile-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: isActiveAdmin ? '2rem 2rem' : '4rem 2rem' }}>
                
                {/* Header Actions */}
                <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                    <button 
                        onClick={() => navigate(homePath)}
                        style={{ background: 'none', border: 'none', color: '#71717A', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <ArrowLeft size={18} /> {isActiveAdmin ? 'Back to Dashboard' : 'Back to Gallery'}
                    </button>
                    {!isActiveAdmin && (
                        <button 
                            onClick={() => { logoutFn(); navigate(isActiveAdmin ? '/admin/login' : '/login'); }}
                            style={{ background: '#18181B', border: '1px solid #27272A', color: '#EF4444', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    )}
                </div>

                {/* Profile Card */}
                <div className="profile-card" style={{ 
                    width: '100%', maxWidth: '800px', background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '32px', overflow: 'hidden', paddingBottom: '3rem'
                }}>
                    
                    {/* Cover Area */}
                    <div style={{ height: '180px', background: isActiveAdmin ? 'linear-gradient(90deg, #581c87 0%, #2e1065 100%)' : 'linear-gradient(90deg, #18181B 0%, #09090B 100%)', position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'radial-gradient(#FFF 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                        {isActiveAdmin && (
                            <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', color: '#FFF', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em' }}>ADMIN ACCOUNT</div>
                        )}
                    </div>

                    {/* Profile Info Overlay */}
                    <div className="profile-info" style={{ padding: '0 3rem', marginTop: '-60px', textAlign: 'center' }}>
                        
                        {/* Avatar */}
                        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                            <img 
                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${activeProfile?.username || 'Guest'}`}
                                alt="User"
                                style={{ 
                                    width: '120px', height: '120px', borderRadius: '40px', background: '#09090B', 
                                    border: '6px solid #000', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' 
                                }}
                            />
                            <div style={{ 
                                position: 'absolute', bottom: '0', right: '0', background: '#FFF', 
                                padding: '8px', borderRadius: '12px', border: '4px solid #000', cursor: 'pointer' 
                            }}>
                                <Camera size={16} color="#000" />
                            </div>
                        </div>

                        {/* Name & Credentials */}
                        {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <input 
                                    value={editUsername}
                                    onChange={e => setEditUsername(e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #FFF', color: '#FFF', padding: '0.8rem 1.5rem', borderRadius: '12px', fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', outline: 'none' }}
                                />
                                <input 
                                    value={editEmail}
                                    onChange={e => setEditEmail(e.target.value)}
                                    type="email"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#A1A1AA', padding: '0.6rem 1rem', borderRadius: '100px', fontSize: '0.9rem', textAlign: 'center', outline: 'none', width: '240px' }}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={handleUpdateProfile} style={{ background: '#FFF', color: '#000', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Save Changes</button>
                                    <button onClick={() => setIsEditing(false)} style={{ background: 'rgba(255,255,255,0.05)', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ marginBottom: '2.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                    <h1 className="profile-name" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFF', letterSpacing: '-0.04em' }}>{activeProfile?.username}</h1>
                                    <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer' }}>
                                        <Edit2 size={20} />
                                    </button>
                                </div>
                                <div style={{ color: '#71717A', fontSize: '1.1rem', fontWeight: 500 }}>{activeProfile?.email}</div>
                            </div>
                        )}

                        {statusMsg.text && (
                            <div style={{ 
                                background: statusMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,64,64,0.1)', 
                                border: `1px solid ${statusMsg.type === 'success' ? '#22C55E' : '#EF4444'}`,
                                color: statusMsg.type === 'success' ? '#22C55E' : '#EF4444',
                                padding: '0.75rem 1.5rem', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '2rem', display: 'inline-block'
                            }}>
                                {statusMsg.text}
                            </div>
                        )}

                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', width: '100%', marginBottom: '2.5rem' }} />

                        {/* Profile Details Grid */}
                        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'left' }}>
                            
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Account Role</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {isActiveAdmin ? <Settings size={20} color="#8b5cf6" /> : <Heart size={20} color="#EF4444" />}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1rem', fontWeight: 800 }}>{isActiveAdmin ? 'System Admin' : 'Standard Member'}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#71717A' }}>{isActiveAdmin ? 'Full Control' : 'Unlocked Features'}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Member Since</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Calendar size={20} color="#71717A" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1rem', fontWeight: 800 }}>{new Date().getFullYear()}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#71717A' }}>Join Year</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Privacy Settings</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Settings size={20} color="#71717A" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1rem', fontWeight: 800 }}>Encrypted</div>
                                        <div style={{ fontSize: '0.8rem', color: '#22C55E' }}>Data Secured</div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Dangerous Zone */}
                        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                            <button 
                                onClick={handleDeleteAccount}
                                style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                <Trash2 size={14} style={{ marginRight: '0.25rem' }} /> {isActiveAdmin ? 'Terminate Administrator Access' : 'Permanent Account Deletion'}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;