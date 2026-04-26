import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Search, LayoutGrid, Bookmark, PlusCircle } from 'lucide-react';

const Navbar = ({ currentView, onView, query, setQuery, onAuthModal, hidden }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, token, admin, adminToken } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Hide navbar on admin, user management, and prompt detail pages
  const isAdminPath = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/users') ||
    location.pathname.startsWith('/prompt');

  if (isAdminPath) {
    return null;
  }

  return (
    <>
      <style>{`
        .nav-container {
          position: fixed; top: 1.5rem; left: 50%; transform: translateX(-50%);
          z-index: 20000; width: 92%; max-width: 1320px;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          ${hidden ? 'opacity: 0; pointer-events: none; transform: translateX(-50%) translateY(-20px);' : ''}
        }
        .nav-inner {
          background: ${scrolled ? "rgba(3, 3, 3, 0.6)" : "rgba(255, 255, 255, 0.02)"};
          backdrop-filter: blur(32px) saturate(2);
          -webkit-backdrop-filter: blur(32px) saturate(2);
          border: 1px solid transparent;
          border-image: ${scrolled ? "linear-gradient(to right, rgba(0,240,255,0.4), rgba(139,92,246,0.4), rgba(0,240,255,0.4)) 1" : "none"};
          border-color: ${scrolled ? "transparent" : "rgba(255,255,255,0.08)"};
          border-radius: 100px;
          padding: 0.5rem 1.2rem;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: ${scrolled ? "0 25px 60px -12px rgba(0,240,255,0.2)" : "0 10px 40px -10px rgba(0,0,0,0.6)"};
          transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .nav-links-desktop a {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.3s ease;
        }
        .nav-links-desktop a:hover {
          transform: translateY(-2px) scale(1.05);
        }
        .nav-search-desktop > div {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .nav-search-desktop > div:focus-within {
          transform: scale(1.03);
          border-color: rgba(0, 240, 255, 0.45);
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);
        }
        .nav-links-desktop { display: flex; align-items: center; gap: 2.5rem; }
        .nav-search-desktop { flex: 1; max-width: 340px; margin: 0 1.5rem; }
        .mobile-btn { display: none; background: none; border: none; color: #FFF; cursor: pointer; padding: 4px; }
        
        @media (max-width: 1024px) {
          .nav-links-desktop, .nav-search-desktop { display: none; }
          .mobile-btn { display: block; }
          .nav-container { top: 1rem; width: 95%; }
          .nav-auth-desktop span { display: none; }
        }

        .mobile-overlay {
          position: fixed; inset: 0; background: rgba(3,3,3,0.98);
          backdrop-filter: blur(40px); z-index: 21000;
          display: flex; flex-direction: column; padding: 2.5rem;
          transform: translateY(-100%); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mobile-overlay.open { transform: translateY(0); }
        .mobile-link {
          padding: 1.25rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.5); text-decoration: none; font-size: 1.5rem; font-weight: 700;
          display: flex; align-items: center; gap: 1rem; transition: all 0.4s;
        }
        .mobile-link.active { color: var(--nc-neon-cyan); letter-spacing: 0.05em; text-shadow: 0 0 15px rgba(0,240,255,0.3); }
        .mobile-link:hover { color: #FFF; padding-left: 15px; }
      `}</style>

      <div className="nav-container">
        <nav className="nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="mobile-btn" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <span style={{
                fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 950, fontSize: "1.4rem",
                color: "#FFF", textTransform: "lowercase", letterSpacing: "-0.04em",
                filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))"
              }}>
                propy
              </span>
            </a>
          </div>

          <div className="nav-links-desktop">
            {[{ id: "GALLERY", label: "Gallery" }, { id: "COLLECTIONS", label: "Curation" }, { id: "WISHLIST", label: "Wishlist" }, { id: "UPLOAD", label: "Create" }].map(item => (
              <button
                key={item.id}
                onClick={e => {
                  e.preventDefault();
                  if ((item.id === "UPLOAD" || item.id === "WISHLIST" || item.id === "STUDIO") && !token && !adminToken) {
                    onAuthModal(true);
                    return;
                  }
                  onView(item.id);
                }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "0.5rem 0", textDecoration: "none", fontSize: "0.82rem", fontWeight: 700,
                  color: currentView === item.id ? "#FFF" : "#71717A",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  transition: "all 0.2s ease", position: "relative",
                  display: "flex", flexDirection: "column", alignItems: "center"
                }}
              >
                {item.label}
                {currentView === item.id && (
                  <span style={{
                    position: "absolute", bottom: "-6px", width: "4px", height: "4px",
                    borderRadius: "50%", background: "var(--nc-neon-cyan)", boxShadow: "0 0 10px var(--nc-neon-cyan)"
                  }} />
                )}
              </button>
            ))}
          </div>

          {/* Integrated Search */}
          <div className="nav-search-desktop">
            <div style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              background: "var(--nc-glass-2)", border: "1px solid var(--nc-bdr)",
              borderRadius: "100px", padding: "0.4rem 1.1rem", transition: "all 0.3s ease"
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--nc-neon-cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                style={{
                  background: "none", border: "none", outline: "none", color: "var(--nc-txt-1)",
                  fontSize: "0.8rem", width: "100%", fontWeight: 500, fontFamily: "'Cabinet Grotesk', sans-serif"
                }}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search database..."
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1rem" }}>×</button>
              )}
            </div>
          </div>

          {/* Authentication / Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {token || adminToken ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF', opacity: 0.9 }}>
                  {user?.username || admin?.username || "Logged In"}
                </span>
                <a href="/profile" style={{ display: "flex", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
                  <img
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.username || admin?.username || 'Guest'}`}
                    alt="Profile"
                    style={{
                      width: "36px", height: "36px", borderRadius: "12px",
                      background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.15)",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.4)"
                    }}
                  />
                </a>
              </div>
            ) : (
              <a href="/login" style={{ textDecoration: "none" }}>
                <button style={{
                  background: "#FFF", color: "#000", border: "none", borderRadius: "100px",
                  padding: "0.6rem 1.5rem", fontSize: "0.8rem", fontWeight: 800,
                  cursor: "pointer", transition: "all 0.2s ease"
                }}
                  onMouseOver={e => e.target.style.transform = "scale(1.05)"}
                  onMouseOut={e => e.target.style.transform = "scale(1)"}
                >
                  Sign In
                </button>
              </a>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
          <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: "1.75rem", color: "#FFF" }}>propy</span>
          <button style={{ background: 'none', border: 'none', color: '#FFF' }} onClick={() => setMobileMenuOpen(false)}>
            <X size={32} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {[{ id: "GALLERY", label: "Gallery", icon: LayoutGrid }, { id: "COLLECTIONS", label: "Curation", icon: Bookmark }, { id: "WISHLIST", label: "Wishlist", icon: Bookmark }, { id: "UPLOAD", label: "Create", icon: PlusCircle }].map(item => (
            <button
              key={item.id}
              className={`mobile-link ${currentView === item.id ? 'active' : ''}`}
              onClick={e => {
                e.preventDefault();
                setMobileMenuOpen(false);
                if ((item.id === "UPLOAD" || item.id === "WISHLIST") && !token && !adminToken) { onAuthModal(true); return; }
                onView(item.id);
              }}
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
            >
              <item.icon size={24} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Navbar;
