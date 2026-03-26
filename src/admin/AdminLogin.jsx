import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import config from '../url/config';

const AdminLogin = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin, userLogout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${config.API_BASE_URL}/auth/admin/login`, { email, password });
      userLogout(); // Enforce strict isolation
      adminLogin(res.data.token, res.data.user);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Admin access denied. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#07080f', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem', 
      fontFamily: "'DM Sans', sans-serif" 
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
        
        .admin-login-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 28px;
          padding: 3.5rem 2.5rem;
          backdrop-filter: blur(24px);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 92, 246, 0.1);
          position: relative;
          z-index: 1;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .input-group:focus-within label {
          color: #8b5cf6;
        }

        .admin-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3.2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          color: #fff;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .admin-input:focus {
          border-color: rgba(139, 92, 246, 0.5);
          background: rgba(139, 92, 246, 0.03);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
        }

        .submit-btn {
          width: 100%;
          padding: 1.1rem;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #fff;
          border: none;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(139, 92, 246, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>

      {/* Background Orbs */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="admin-login-card">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            width: '64px', height: '64px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', 
            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)'
          }}>
            <ShieldCheck size={32} color="#8b5cf6" />
          </div>
          <h1 style={{ 
            fontSize: '2.25rem', fontWeight: 800, color: '#fff', 
            fontFamily: "'Syne', sans-serif", letterSpacing: '-0.04em', marginBottom: '0.5rem' 
          }}>Admin Portal</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500 }}>Authorized personnel only</p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', 
            borderRadius: '16px', color: '#f87171', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem',
            animation: 'shake 0.4s ease'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                type="email"
                placeholder="admin@fashion.com"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Secure Password</label>
              <Link to="#" style={{ fontSize: '0.75rem', color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>Forgot Access?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                type="password"
                placeholder="••••••••"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="submit-btn"
          >
            {loading ? (
              <><Loader2 size={20} className="spin-animation" /><span>Authenticating...</span></>
            ) : (
              <><ShieldCheck size={20} /><span>Verify & Enter</span><ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
            New Administrator? {' '}
            <Link to="/admin/register" style={{ color: '#8b5cf6', fontWeight: 700, textDecoration: 'none' }}>Request Access</Link>
          </p>
        </div>
      </div>
      
      <style>{`
        .spin-animation { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
