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
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
        
        body { margin: 0; background: #000; }

        .admin-login-card {
          width: 100%;
          max-width: 440px;
          background: rgba(10, 10, 12, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          padding: 4rem 3rem;
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.9), inset 0 0 0 1px rgba(255, 255, 255, 0.03);
          position: relative;
          z-index: 10;
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'Cabinet Grotesk', sans-serif;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .input-group label {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-weight: 700;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 0.8rem;
          display: block;
          transition: color 0.3s;
        }

        .input-group:focus-within label {
          color: #fff;
        }

        .admin-input {
          width: 100%;
          padding: 1.1rem 1.1rem 1.1rem 3.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          color: #fff;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 500;
          outline: none;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .admin-input:focus {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }

        .submit-btn {
          width: 100%;
          padding: 1.25rem;
          background: #fff;
          color: #000;
          border: none;
          border-radius: 100px;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 40px rgba(255, 255, 255, 0.1);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-4px) scale(1.02);
          background: #f4f4f5;
          box-shadow: 0 20px 60px rgba(255, 255, 255, 0.2);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(-1px) scale(0.98);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .admin-bg-noise {
          position: fixed; inset: 0; z-index: 1;
          background-image: url("https://grainy-gradients.vercel.app/noise.svg");
          opacity: 0.05; pointer-events: none; mix-blend-mode: overlay;
        }

        .admin-bg-glow {
          position: absolute; width: 800px; height: 800px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%);
          filter: blur(100px); pointer-events: none; z-index: 2;
        }
      `}</style>

      <div className="admin-bg-noise" />
      <div className="admin-bg-glow" style={{ top: '-10%', right: '-10%' }} />
      <div className="admin-bg-glow" style={{ bottom: '-10%', left: '-10%' }} />

      <div className="admin-login-card">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            width: '72px', height: '72px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}>
            <ShieldCheck size={36} color="#fff" strokeWidth={1.5} />
          </div>
          <h1 style={{
            fontSize: '2.5rem', fontWeight: 900, color: '#fff',
            letterSpacing: '-0.05em', marginBottom: '0.75rem', lineHeight: 1
          }}>ADMIN <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>PORTAL</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.02em' }}>Secure Access System</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.1rem',
            borderRadius: '18px', color: '#fca5a5', fontSize: '0.9rem', textAlign: 'center', marginBottom: '2rem',
            fontWeight: 500, animation: 'shake 0.5s ease'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div className="input-group">
            <label>Master Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
              <input
                type="email"
                placeholder="admin@propy.art"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <label>Passkey</label>
              <Link to="#" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>Recovery?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
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
              <><Loader2 size={20} className="spin-animation" /><span>Verifying...</span></>
            ) : (
              <><ShieldCheck size={20} strokeWidth={2.5} /><span>Authenticate</span><ArrowRight size={20} strokeWidth={2.5} /></>
            )}
          </button>
        </form>

        <div style={{ marginTop: '3.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 500 }}>
            Restricted Zone. {' '}
            <Link to="/admin/register" style={{ color: '#fff', fontWeight: 800, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Enroll Admin</Link>
          </p>
        </div>
      </div>

      <style>{`
        .spin-animation { animation: spin 1.2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-8px); }
          30%, 60%, 90% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
