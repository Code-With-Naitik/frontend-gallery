import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ currentView, onView, query, setQuery, onAuthModal }) => {
  const [scrolled, setScrolled] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{
      position: "fixed", top: "1.5rem", left: "50%", transform: "translateX(-50%)",
      zIndex: 1000, width: "auto", minWidth: "40%", maxWidth: "1320px",
      transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)"
    }}>
      <nav style={{
        background: scrolled ? "rgba(10, 10, 12, 0.85)" : "rgba(12, 12, 14, 0.6)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "100px",
        padding: "0.6rem 1.7rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: scrolled ? "0 20px 40px rgba(0,0,0,0.6)" : "0 10px 30px rgba(0,0,0,0.3)",
        transition: "all 0.4s ease"
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", gap: "5rem" }}>
          {/* Logo */}
          <span style={{
            fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: "1.25rem",
            color: "#FFF", textTransform: "lowercase", gap: "3rem"
          }}>
            banana
          </span>
        </a>

        {/* Navigation Core */}
        <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
          {[
            { id: "GALLERY", label: "Gallery" },
            { id: "COLLECTIONS", label: "Curation" },
            { id: "WISHLIST", label: "Wishlist" },
            { id: "UPLOAD", label: "Create" }
          ].map(item => (
            <a
              key={item.id}
              href="#"
              onClick={e => {
                e.preventDefault();
                if ((item.id === "UPLOAD" || item.id === "WISHLIST") && !token) {
                  onAuthModal(true);
                  return;
                }
                onView(item.id);
              }}
              style={{
                textDecoration: "none", fontSize: "0.82rem", fontWeight: 700,
                color: currentView === item.id ? "#FFF" : "#71717A",
                textTransform: "uppercase", letterSpacing: "0.06em",
                transition: "all 0.2s ease",
                position: "relative",
                display: "flex", flexDirection: "column", alignItems: "center"
              }}
              onMouseOver={e => e.target.style.color = "#FFF"}
              onMouseOut={e => { if (currentView !== item.id) e.target.style.color = "#71717A" }}
            >
              {item.label}
              {currentView === item.id && (
                <span style={{
                  position: "absolute", bottom: "-6px", width: "4px", height: "4px",
                  borderRadius: "50%", background: "#FFF", boxShadow: "0 0 10px #FFF"
                }} />
              )}
            </a>
          ))}
        </div>

        {/* Integrated Search */}
        <div style={{ flex: 1, maxWidth: "340px", margin: "0 1.5rem" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "100px", padding: "0.4rem 1.1rem", transition: "all 0.3s ease"
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              style={{
                background: "none", border: "none", outline: "none", color: "#FFF",
                fontSize: "0.8rem", width: "100%", fontWeight: 500, fontFamily: "'Cabinet Grotesk', sans-serif"
              }}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search prompts..."
            />
            {query && (
              <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1rem" }}>×</button>
            )}
          </div>
        </div>

        {/* Authentication / Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {!token ? (
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
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <a href="/profile" style={{ display: "flex", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
                <img
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.username || 'Guest'}`}
                  alt="User"
                  style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.15)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  }}
                />
              </a>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
