import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';
import config from '../../url/config';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${config.API_BASE_URL}/auth/register`, formData);
      navigate('/login', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      padding: '2rem', fontFamily: "'Cabinet Grotesk', sans-serif" 
    }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', top: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ 
        width: '100%', maxWidth: '440px', background: 'rgba(10,10,10,0.8)', border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: '24px', padding: '3rem 2.5rem', backdropFilter: 'blur(20px)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)', 
        position: 'relative', zIndex: 1 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '56px', height: '56px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' 
          }}>
            <UserPlus size={24} color="#FFF" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ color: '#71717A', fontSize: '0.95rem', fontWeight: 500 }}>Join our community of fashion prompt creators</p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.9rem', 
            borderRadius: '12px', color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#52525B' }} />
              <input
                type="text"
                placeholder="yourname"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
                style={{ 
                  width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#FFF', 
                  fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s' 
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#52525B' }} />
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={{ 
                  width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#FFF', 
                  fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s' 
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#52525B' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                style={{ 
                  width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#FFF', 
                  fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s' 
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', padding: '1rem', background: '#FFF', color: '#000', border: 'none', borderRadius: '12px', 
              fontSize: '1rem', fontWeight: 700, cursor: loading ? 'default' : 'pointer', marginTop: '1rem', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' 
            }}
            onMouseOver={(e) => { if(!loading) e.target.style.background = '#E4E4E7' }}
            onMouseOut={(e) => { if(!loading) e.target.style.background = '#FFF' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <p style={{ color: '#71717A', fontSize: '0.9rem', fontWeight: 500 }}>
            Already have an account? {' '}
            <Link to="/login" style={{ color: '#FFF', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
