import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
    LayoutGrid, User, LogOut, ShieldCheck, Mail, Calendar, 
    Shield, ArrowLeft, Edit3, Camera
} from 'lucide-react';

const AdminProfile = () => {
    const { admin, adminLogout } = useAuth();
    const navigate = useNavigate();

    const sidebarCss = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        :root {
            --bg: #07080f;
            --surface: rgba(255,255,255,.03);
            --surface-hover: rgba(255,255,255,.06);
            --border: rgba(255,255,255,.07);
            --accent: #8b5cf6;
            --text: #e2e8f0;
            --muted: #64748b;
            --sidebar-w: 240px;
        }

        .admin-layout {
            display: flex;
            min-height: 100vh;
            background: var(--bg);
            color: var(--text);
            font-family: 'DM Sans', sans-serif;
        }

        .sidebar {
            width: var(--sidebar-w);
            background: rgba(255,255,255,.02);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            position: fixed;
            height: 100vh;
            left: 0;
            top: 0;
        }

        .sidebar-brand {
            padding: 28px 20px;
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid var(--border);
        }

        .sidebar-nav {
            padding: 20px 10px;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            border-radius: 12px;
            color: var(--muted);
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
            background: transparent;
            border: none;
            width: 100%;
            cursor: pointer;
            text-align: left;
        }

        .nav-item:hover {
            color: var(--text);
            background: var(--surface-hover);
        }

        .nav-item.active {
            color: var(--text);
            background: rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .logout-btn {
            margin: 20px 10px;
            padding: 12px 14px;
            border-radius: 12px;
            color: #f87171;
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
            background: transparent;
            border: none;
            width: calc(100% - 20px);
            cursor: pointer;
        }

        .logout-btn:hover {
            background: rgba(239, 68, 68, 0.08);
        }

        .profile-container {
            margin-left: var(--sidebar-w);
            flex: 1;
            padding: 40px;
            max-width: 1000px;
        }

        .profile-header {
            margin-bottom: 40px;
        }

        .back-link {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--muted);
            text-decoration: none;
            font-size: 14px;
            margin-bottom: 20px;
            transition: color 0.2s;
        }

        .back-link:hover {
            color: var(--text);
        }

        .profile-title {
            font-family: 'Syne', sans-serif;
            font-size: 2.5rem;
            font-weight: 800;
            letter-spacing: -0.04em;
        }

        .profile-grid {
            display: grid;
            grid-template-columns: 320px 1fr;
            gap: 40px;
        }

        .profile-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 32px;
            text-align: center;
        }

        .avatar-container {
            position: relative;
            width: 120px;
            height: 120px;
            margin: 0 auto 24px;
        }

        .profile-avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(139, 92, 246, 0.1);
            border: 2px solid var(--accent);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--accent);
            padding: 4px;
        }

        .edit-avatar {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 36px;
            height: 36px;
            background: var(--accent);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            border: 4px solid var(--bg);
            cursor: pointer;
            transition: transform 0.2s;
        }

        .edit-avatar:hover {
            transform: scale(1.1);
        }

        .profile-name {
            font-family: 'Syne', sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .profile-role {
            background: rgba(139, 92, 246, 0.1);
            color: var(--accent);
            padding: 4px 12px;
            border-radius: 100px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .info-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 32px;
        }

        .section-title {
            font-family: 'Syne', sans-serif;
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .info-group {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .info-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 16px;
            border: 1px solid var(--border);
        }

        .info-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: rgba(139, 92, 246, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--accent);
        }

        .info-label {
            font-size: 12px;
            color: var(--muted);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .info-value {
            font-size: 15px;
            font-weight: 500;
            margin-top: 2px;
        }

        .action-btn {
            margin-top: 32px;
            width: 100%;
            padding: 14px;
            background: var(--accent);
            color: #fff;
            border: none;
            border-radius: 14px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s;
        }

        .action-btn:hover {
            filter: brightness(1.1);
            transform: translateY(-2px);
        }
    `;

    const handleLogout = () => {
        adminLogout();
        navigate('/admin/login');
    };

    return (
        <div className="admin-layout">
            <style>{sidebarCss}</style>

            <aside className="sidebar">
                <div className="sidebar-brand">
                    <LayoutGrid size={20} color="var(--accent)" />
                    <span>Admin Panel</span>
                </div>
                
                <nav className="sidebar-nav">
                    <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <LayoutGrid size={18} /><span>Collections</span>
                    </NavLink>
                    <NavLink to="/users" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <User size={18} /><span>Users</span>
                    </NavLink>
                    <NavLink to="/admin/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <ShieldCheck size={18} /><span>Profile</span>
                    </NavLink>
                </nav>

                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={18} /><span>Logout</span>
                </button>
            </aside>

            <main className="profile-container">
                <header className="profile-header">
                    <div onClick={() => navigate('/admin')} className="back-link" style={{ cursor: 'pointer' }}>
                        <ArrowLeft size={16} /><span>Back to Dashboard</span>
                    </div>
                    <h1 className="profile-title">Admin Profile</h1>
                </header>

                <div className="profile-grid">
                    <div className="profile-side">
                        <div className="profile-card">
                            <div className="avatar-container">
                                <div className="profile-avatar">
                                    <User size={64} />
                                </div>
                                <div className="edit-avatar">
                                    <Camera size={16} />
                                </div>
                            </div>
                            <h2 className="profile-name">{admin?.username || 'Administrator'}</h2>
                            <span className="profile-role">Super Admin</span>
                            
                            <button className="action-btn">
                                <Edit3 size={18} /><span>Edit Profile</span>
                            </button>
                        </div>
                    </div>

                    <div className="profile-content">
                        <div className="info-card">
                            <h3 className="section-title">
                                <Shield size={20} /><span>Account Details</span>
                            </h3>
                            
                            <div className="info-group">
                                <div className="info-item">
                                    <div className="info-icon"><User size={20} /></div>
                                    <div>
                                        <div className="info-label">Display Name</div>
                                        <div className="info-value">{admin?.username}</div>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-icon"><Mail size={20} /></div>
                                    <div>
                                        <div className="info-label">Email Address</div>
                                        <div className="info-value">{admin?.email}</div>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-icon"><ShieldCheck size={20} /></div>
                                    <div>
                                        <div className="info-label">Access Level</div>
                                        <div className="info-value">Full System Administrative Access</div>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-icon"><Calendar size={20} /></div>
                                    <div>
                                        <div className="info-label">Administrative Since</div>
                                        <div className="info-value">{new Date(admin?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminProfile;
