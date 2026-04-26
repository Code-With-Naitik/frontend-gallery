import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../url/config";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { Heart, Search, Filter, Copy, ExternalLink, Trash2, Home, Compass, Bookmark, Image, Plus, X, LogOut, Check } from "lucide-react";
import Navbar from "./Navbar";

/* ─────────────────────────────────────────────
   DESIGN SYSTEM — GLOBAL CSS
───────────────────────────────────────────── */

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg1:  var(--nc-bg, #030303);
    --bg2:  rgba(255,255,255,0.015);
    --bg3:  rgba(255,255,255,0.03);
    --bg4:  rgba(255,255,255,0.06);
    --primary: var(--nc-neon-cyan, #00f0ff);
    --txt1: #FFFFFF;
    --txt2: rgba(255,255,255,0.7);
    --txt3: rgba(255,255,255,0.4);
    --bdr:  var(--nc-bdr, rgba(255,255,255,0.08));
    --bdr-h:var(--nc-bdr-glow, rgba(0,240,255,0.2));
    --easing: cubic-bezier(0.16,1,0.3,1);
  }

  body {
    background: var(--bg1);
    color: var(--txt1);
    font-family: 'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    cursor: default;
  }

  /* ── UNIQUE GRAIN OVERLAY ── */
  body::after {
    content: ""; position: fixed; inset: 0; z-index: 9998;
    background-image: url("https://grainy-gradients.vercel.app/noise.svg");
    opacity: 0.04; pointer-events: none; mix-blend-mode: overlay;
  }

  body::before {
    content: '';
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.02) 0%, transparent 70%);
  }


  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg1); }
  ::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 10px; }

  .font-ui { font-family: 'Cabinet Grotesk', sans-serif; }

  /* ── RESPONSIVE UTILS ── */
  .hp-hero-title {
    font-family: 'Cabinet Grotesk', sans-serif; font-weight: 900;
    font-size: clamp(2.8rem, 9vw, 6.5rem); lineHeight: 1; letter-spacing: -0.06em;
    background: var(--nc-gradient, linear-gradient(135deg, #00f0ff 0%, #8a2be2 100%));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    padding-bottom: 0.2em;
    filter: drop-shadow(0 0 40px rgba(0, 240, 255, 0.4)) drop-shadow(0 0 40px rgba(0, 240, 255, 0.2));
  }

  .hp-hero-stats {
    display: flex; gap: 5rem; justify-content: center; 
    border-top: 1px solid var(--bdr); padding: 4rem 1rem;
    margin-top: 4rem;
    position: relative; z-index: 2;
  }
  .stat-val { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; color: var(--txt1); letter-spacing: -0.02em; }
  .stat-lbl { font-size: 0.85rem; color: var(--txt3); font-weight: 500; margin-top: 0.3rem; }

  /* ── HERO GLOW ── */
  .hp-hero-glow {
    position: absolute; top: -10%; left: 50%; transform: translateX(-50%);
    width: 100%; height: 100%;
    background: radial-gradient(circle at 50% 30%, rgba(0,240,255,0.1) 0%, transparent 60%);
    pointer-events: none; z-index: 0;
  }
  .hp-orb {
    position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4;
    animation: float 20s infinite alternate ease-in-out;
    pointer-events: none;
  }
  @keyframes float {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(20px, -40px) scale(1.1); }
  }


  @media (max-width: 768px) {
    .hp-hero-stats { flex-direction: row; gap: 0.5rem; justify-content: space-between; padding: 2.5rem 0; width: 100%; }
    .stat-val { font-size: 1.6rem !important; }
    .stat-lbl { font-size: 0.65rem !important; margin-top: 0.1rem; }
    .spotlight-card { min-width: 300px; height: 440px; }
    .spotlight-title { font-size: 1.6rem; }
    .spotlight-info { padding: 20px; }
    .hp-upload-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
    .hp-upload-zone { height: 260px !important; }
    .hp-upload-section { padding: 1.5rem 1.25rem 6rem !important; }
    .hp-upload-title { font-size: 2rem !important; }
    .hp-upload-2col { grid-template-columns: 1fr !important; }
    
    /* Mobile hero padding */
    .hp-hero-inner { padding: 0 1.25rem !important; }
    .hp-hero-actions { flex-direction: column !important; align-items: stretch !important; }
    .hp-hero-actions button { width: 100% !important; justify-content: center !important; }

    /* Featured strip */
    .hp-featured-strip-grid { grid-template-columns: 1fr !important; }
    .hp-featured-img { 
      border-radius: 19px 19px 0 0 !important; 
      min-height: 240px !important;
      height: 240px !important;
    }
    /* Switch gradient direction when stacked: hide top, fade to black at bottom */
    .hp-featured-grad { background: linear-gradient(to bottom, transparent 40%, rgba(5,5,5,0.95) 100%) !important; }
    .hp-featured-info { 
      padding: 2rem 1.25rem !important; 
      text-align: center !important;
      align-items: center !important;
      display: flex !important;
      flex-direction: column !important;
    }
    .hp-featured-info .hp-label { justify-content: center !important; }
    .hp-featured-actions { 
      flex-wrap: wrap !important; 
      justify-content: center !important;
      width: 100% !important;
    }
    .hp-featured-actions button { flex: 1 1 130px !important; justify-content: center !important; }
    
    .hp-filter-scroller {
      overflow-x: auto; -webkit-overflow-scrolling: touch;
      scrollbar-width: none; -ms-overflow-style: none;
      display: flex; gap: 0.8rem; padding: 0.5rem 0 1.5rem;
      mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
      -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
    }
    .hp-filter-scroller::-webkit-scrollbar { display: none; }

    /* Cards on mobile: smaller min-height */
    .hp-card { min-height: 320px !important; }

    /* Gallery & section padding */
    .hp-gallery-wrap { padding: 1.25rem 1rem 5rem !important; }
    .hp-section-pad { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }

    /* Spotlight section header — center on mobile */
    .hp-spotlight-header {
      flex-direction: column !important;
      align-items: center !important;
      text-align: center !important;
      padding: 0 1.25rem 3rem !important;
    }
    .hp-spotlight-header > div { width: 100%; text-align: center; }
    .hp-spotlight-header > div > div { justify-content: center !important; }
    .hp-spotlight-header button { width: 100%; justify-content: center; }
    
    .hp-touch-glow { display: none !important; }
  }
  @media (max-width: 480px) {
    .spotlight-card { min-width: 260px; height: 380px; }
    .hp-hero-badge { letter-spacing: 0.1em !important; font-size: 0.65rem !important; padding: 0.3rem 0.8rem !important; }
    .hp-modal-img-panel { height: 220px !important; }
  }

  /* ── FadeUp keyframe ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes marqueeScroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes toastSlideIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* ── Fade-in on scroll ── */
  .hp-fade { opacity: 0; transform: translateY(20px); transition: opacity 0.6s var(--easing), transform 0.6s var(--easing); }
  .hp-fade.visible { opacity: 1; transform: translateY(0); }

  /* ── NAV ── */
  .hp-nav-wrapper {
    position: fixed; top: 1.5rem; left: 0; right: 0;
    display: flex; justify-content: center; z-index: 300;
    pointer-events: none;
  }
  .hp-nav {
    display: flex; align-items: center; justify-content: space-between; gap: 2rem;
    padding: 0.5rem 0.6rem 0.5rem 1.5rem;
    background: rgba(9, 9, 11, 0.65);
    backdrop-filter: blur(24px) saturate(1.8);
    -webkit-backdrop-filter: blur(24px) saturate(1.8);
    border: 1px solid var(--bdr);
    border-radius: 100px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    pointer-events: auto;
  }
  .hp-nav-link {
    font-weight: 500; font-size: 0.85rem; letter-spacing: 0.02em;
    color: var(--txt2); text-decoration: none;
    transition: color 0.25s var(--easing);
  }
  .hp-nav-link:hover, .hp-nav-link.active { color: var(--txt1); }

  /* ── BUTTONS ── */
  .hp-btn-primary {
    background: var(--nc-gradient, linear-gradient(135deg, #00f0ff 0%, #8a2be2 100%));
    color: #000;
    border: none; border-radius: 100px;
    padding: 0.8rem 1.7rem;
    font-family: 'Cabinet Grotesk', sans-serif; font-weight: 800; font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 240, 255, 0.4);
    transition: transform 0.25s var(--easing), box-shadow 0.25s var(--easing);
    display: inline-flex; align-items: center; gap: 0.5rem;
    white-space: nowrap;
  }
  .hp-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(0, 240, 255, 0.6);
  }
  .hp-btn-ghost {
    background: transparent;
    border: 1px solid var(--bdr);
    color: var(--txt1); border-radius: 100px;
    padding: 0.8rem 1.7rem;
    font-family: 'Cabinet Grotesk', sans-serif; font-weight: 600; font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.25s var(--easing), border-color 0.25s var(--easing), transform 0.25s var(--easing);
    display: inline-flex; align-items: center; gap: 0.5rem;
    white-space: nowrap;
  }
  .hp-btn-ghost:hover {
    background: rgba(255,255,255,0.05);
    border-color: var(--bdr-h);
    transform: translateY(-2px);
  }

  /* ── PREMIUM DARK CARDS (RESTYLED NEO-CHROME) ── */
  .hp-card {
    background: rgba(3, 3, 3, 0.4);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid var(--nc-bdr);
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    transition: transform 0.4s var(--easing), border-color 0.3s, box-shadow 0.4s;
    min-height: 420px;
    display: flex;
    flex-direction: column;
  }
  .hp-card:hover {
    transform: translateY(-8px);
    border-color: var(--nc-neon-cyan);
    box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0, 240, 255, 0.15);
  }
  
  .hp-card-accent-bar {
    height: 2.5px;
    background: var(--nc-gradient, linear-gradient(135deg, #00f0ff 0%, #8a2be2 100%));
    width: 100%;
    position: absolute; top: 0; left: 0; z-index: 5;
  }

  .hp-card-img-zone {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    overflow: hidden;
  }
  .hp-card-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.6s var(--easing);
  }
  .hp-card:hover .hp-card-img {
    transform: scale(1.08);
  }

  .hp-card-scrim {
    position: absolute; inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0,0,0,0.12) 0%,
      rgba(0,0,0,0.00) 35%,
      rgba(0,0,0,0.00) 45%,
      rgba(0,0,0,0.82) 100%
    );
    z-index: 1;
  }

  /* ── BADGES ── */
  .hp-badge-f {
    position: absolute; top: 1.25rem; left: 1.25rem; z-index: 3;
    background: rgba(0,240,255,0.1);
    color: var(--nc-neon-cyan);
    border: 0.5px solid rgba(0,240,255,0.3);
    font-size: 10px; font-weight: 700; letter-spacing: 0.07em;
    padding: 4px 10px; border-radius: 100px;
    text-transform: uppercase;
    box-shadow: 0 0 10px rgba(0,240,255,0.2);
  }

  /* ── METADATA TAGS ── */
  .hp-meta-badge {
    padding: 3px 8px; border-radius: 4px; font-size: 9px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .priority-high { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
  .priority-med  { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
  .priority-low  { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }


  .hp-likes-pill {
    position: absolute; top: 1.25rem; right: 1.25rem; z-index: 3;
    background: rgba(0,0,0,0.45);
    color: #FFFFFF;
    border: 0.5px solid rgba(255,255,255,0.15);
    font-size: 12px; padding: 4px 11px; border-radius: 100px;
    display: flex; align-items: center; gap: 4px;
    transition: all 0.28s var(--easing);
  }
  .hp-likes-pill.liked {
    background: rgba(239, 68, 68, 0.45);
    border-color: rgba(239, 68, 68, 0.6);
  }

  /* ── CONTENT ── */
  .hp-card-content {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 20px 18px 18px;
    z-index: 2;
  }

  .hp-category-label {
    font-size: 10px; font-weight: 500; letter-spacing: 0.10em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.50);
    display: flex; align-items: center; gap: 7px;
    margin-bottom: 6px;
  }
  .hp-category-line { width: 14px; height: 1px; background: rgba(255,255,255,0.35); }

  .hp-card-title-p {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 18px;
    font-weight: 500;
    color: #FFFFFF;
    letter-spacing: -0.02em;
    line-height: 1.25;
    margin-bottom: 10px;
  }
  .hp-card-title-p.large { font-size: 24px; }

  .hp-excerpt {
    font-size: 11px; line-height: 1.75;
    color: rgba(255,255,255,0.55);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    margin-bottom: 14px;
  }

  .hp-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px;
    border-top: 0.5px solid rgba(255,255,255,0.12);
  }

  .hp-author { display: flex; align-items: center; gap: 8px; }
  .hp-author-img {
    width: 22px; height: 22px; border-radius: 50%; object-fit: cover;
    border: 1.5px solid rgba(255,255,255,0.25);
    filter: grayscale(100%);
  }
  .hp-author-name { font-size: 11px; color: rgba(255,255,255,0.50); font-weight: 500; }

  .hp-btn-row { display: flex; gap: 8px; }
  .hp-btn-s-ghost {
    background: rgba(255,255,255,0.10);
    color: rgba(255,255,255,0.70);
    border: 0.5px solid rgba(255,255,255,0.18);
    font-size: 10px; font-weight: 500; padding: 5px 12px;
    border-radius: 8px; letter-spacing: 0.04em;
    cursor: pointer; transition: all 0.2s;
  }
  .hp-btn-s-ghost:hover { background: rgba(255,255,255,0.20); color: #fff; }

  .hp-btn-s-solid {
    background: var(--nc-gradient, linear-gradient(135deg, #00f0ff 0%, #8a2be2 100%));
    color: #000000;
    border: none;
    font-size: 10px; font-weight: 700; padding: 5px 12px;
    border-radius: 8px; letter-spacing: 0.04em;
    cursor: pointer; transition: opacity 0.2s, box-shadow 0.2s;
  }
  .hp-btn-s-solid:hover { opacity: 0.88; box-shadow: 0 0 10px rgba(0,240,255,0.4); }

  .hp-model-chip-f {
    position: absolute; bottom: 14px; right: 14px; z-index: 2;
    font-size: 9px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: rgba(255,255,255,0.60);
    background: rgba(0,0,0,0.50);
    border: 0.5px solid rgba(255,255,255,0.12);
    padding: 3px 9px; border-radius: 100px;
  }

  /* ── STARS ── */
  .hp-star { color: var(--amb); font-size: 0.85rem; }
  .hp-star-dim { color: var(--txt3); font-size: 0.85rem; }

  /* ── ACTIVE STATE PILL ── */
  .hp-active-pill {
    background: rgba(245,166,35,0.15);
    border: 1px solid rgba(245,166,35,0.3);
    color: var(--amb);
    box-shadow: 0 0 20px rgba(245,166,35,0.15);
  }

  /* ── SEARCH ── */
  .hp-search-wrap {
    position: relative; display: flex; align-items: center;
    background: var(--nc-glass-2); border-radius: 100px;
    border: 1px solid var(--nc-bdr);
    padding: 0.25rem 0.25rem 0.25rem 1.5rem;
    transition: border-color 0.25s, box-shadow 0.25s;
    flex: 1; max-width: 600px; margin: 0 auto;
  }
  .hp-search-wrap:focus-within {
    border-color: var(--nc-neon-cyan);
    box-shadow: 0 0 15px rgba(0,240,255,0.2);
  }
  .hp-search-input {
    background: transparent; border: none; outline: none;
    color: var(--txt1); font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 1rem; font-weight: 500;
    padding: 0.8rem 0.5rem;
    flex: 1; width: 100%;
  }
  .hp-search-input::placeholder { color: var(--txt3); }

  /* ── FILTER TABS ── */
  .hp-filter-tab {
    background: transparent;
    border: 1px solid var(--nc-bdr);
    border-radius: 100px;
    color: var(--txt2);
    font-family: 'Cabinet Grotesk', sans-serif;
    font-weight: 600; font-size: 0.78rem; letter-spacing: 0.04em;
    padding: 0.4rem 1.1rem;
    cursor: pointer;
    transition: all 0.2s var(--easing), box-shadow 0.2s;
    white-space: nowrap;
  }
  .hp-filter-tab:hover { border-color: var(--nc-neon-cyan); color: var(--txt1); }
  .hp-filter-tab.active {
    background: var(--nc-gradient, linear-gradient(135deg, #00f0ff 0%, #8a2be2 100%));
    color: #000;
    font-weight: 800;
    border-color: transparent;
    box-shadow: 0 4px 15px rgba(0,240,255,0.4);
  }

  /* ── MASONRY GRID ── */
  .hp-masonry {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.8rem;
    padding: 0;
  }
  @media (max-width: 1200px) { .hp-masonry { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 768px)  { .hp-masonry { grid-template-columns: 1fr; gap: 1.5rem; } }

  .hp-masonry-item {
    width: 100%;
  }

  /* ── SLIDER ── */
  .hp-slider-wrap {
    display: flex; gap: 1.5rem; overflow-x: auto; padding: 1rem 0 3rem;
    scrollbar-width: none;
    scroll-snap-type: x mandatory;
  }
  .hp-slider-wrap::-webkit-scrollbar { display: none; }
  .hp-slider-item {
    min-width: 280px; max-width: 320px; flex-shrink: 0;
    scroll-snap-align: start;
    aspect-ratio: 9/14;
  }

  .hp-col-card {
    position: relative; border-radius: 24px; overflow: hidden;
    background: var(--nc-glass-2);
    border: 1px solid var(--nc-bdr);
    height: 400px;
    cursor: pointer;
    transition: transform 0.4s var(--easing), border-color 0.4s var(--easing), box-shadow 0.4s var(--easing);
  }
  .hp-col-card::before {
    content: ''; position: absolute; inset: 0;
    border-radius: inherit; pointer-events: none;
    box-shadow: inset 0 0 0 1px var(--nc-glass-1);
    z-index: 10;
  }
  .hp-col-card:hover { transform: translateY(-6px) scale(1.02); border-color: var(--nc-neon-purple); box-shadow: 0 32px 64px rgba(0,0,0,0.8), 0 0 20px rgba(138,43,226,0.3); }
  .hp-col-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s var(--easing); }
  .hp-col-card:hover img { transform: scale(1.06); }
  .hp-col-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.92) 70%);
    display: flex; flex-direction: column; justify-content: flex-end; padding: 1.75rem;
    z-index: 2;
  }

  /* ── MODAL ── */
  .hp-modal-backdrop {
    position: fixed; inset: 0; z-index: 30000;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(20px);
    display: flex; align-items: center; justify-content: center; padding: 2rem 1rem;
  }
  .hp-modal-box {
    max-width: 960px; width: 100%;
    background: rgba(8, 8, 8, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid var(--nc-bdr);
    border-radius: 24px;
    position: relative; max-height: 92vh; overflow: hidden;
    display: grid; grid-template-columns: 1fr 1.15fr;
    animation: fadeUp 0.5s var(--easing) both;
    box-shadow: 0 40px 120px rgba(0,0,0,0.9), 0 0 40px rgba(0,240,255,0.1);
  }
  @media (max-width: 768px) {
    .hp-modal-backdrop { padding: 0; align-items: flex-end; }
    .hp-modal-box {
      grid-template-columns: 1fr; overflow-y: auto;
      border-radius: 28px 28px 0 0; max-height: calc(100% - 90px); width: 100%; height: 100%;
      box-shadow: 0 -10px 40px rgba(0,0,0,0.8);
    }
    .hp-modal-img-panel { height: 260px !important; }
    .hp-modal-info { padding: 1.5rem !important; }
    .hp-modal-actions { flex-direction: column !important; }
    .hp-modal-actions button { width: 100% !important; justify-content: center !important; }
  }


  /* ── SECTION TITLE ── */
  .hp-section-title {
    font-weight: 800;
    font-size: clamp(2rem, 5vw, 3rem);
    color: var(--txt1); line-height: 1.1;
    letter-spacing: -0.03em;
  }

  /* ── CTA GRADIENT BORDER ── */
  .hp-cta-border {
    background: linear-gradient(var(--bg2), var(--bg4)) padding-box,
                linear-gradient(135deg, rgba(245,166,35,0.4), rgba(45,212,191,0.2)) border-box;
    border: 1px solid transparent;
    border-radius: 20px;
  }

  /* ── MARQUEE ── */
  .hp-marquee-wrap {
    overflow: hidden;
    border-top: 1px solid var(--bdr);
    border-bottom: 1px solid var(--bdr);
    padding: 0.9rem 0;
    background: var(--bg4);
  }
  .hp-marquee-track {
    display: flex; width: max-content; gap: 3.5rem; white-space: nowrap;
    animation: marqueeScroll 30s linear infinite;
  }

  /* ── TOAST ── */
  .hp-toast {
    position: fixed; bottom: 3rem; left: 50%; transform: translateX(-50%); z-index: 10000;
    background: rgba(10, 10, 12, 0.7);
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 1rem 1.75rem;
    font-family: 'Cabinet Grotesk', sans-serif;
    color: #FFF;
    display: flex; align-items: center; gap: 1.25rem;
    box-shadow: 0 24px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05);
    animation: toastSlideIn 0.5s var(--easing);
    pointer-events: auto;
    min-width: 320px;
    overflow: hidden;
  }

  .hp-toast-status {
    font-size: 0.65rem; font-weight: 900; letter-spacing: 0.15em;
    color: var(--txt3); text-transform: uppercase;
    background: rgba(255,255,255,0.05);
    padding: 4px 8px; border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .hp-toast-msg {
    font-size: 0.88rem; font-weight: 600; color: #FFF; flex: 1;
  }

  .hp-toast-progress {
    position: absolute; bottom: 0; left: 0; height: 3px;
    background: var(--nc-gradient, linear-gradient(90deg, #00f0ff, #8a2be2));
    animation: toastProgress 2.2s linear forwards;
  }

  @keyframes toastProgress {
    from { width: 100%; }
    to { width: 0%; }
  }

  @keyframes toastSlideIn {
    from { opacity: 0; transform: translate(-50%, 40px) scale(0.95); }
    to { opacity: 1; transform: translate(-50%, 0) scale(1); }
  }

  /* ── LOADER ── */
  .hp-loader {
    width: 28px; height: 28px;
    border: 2px solid var(--bdr);
    border-top-color: var(--amb);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  /* ── TEAL GLOW CIRCLE behind logo ── */
  .hp-logo-ring { animation: pulse-ring 2.5s ease infinite; }

  /* ── DIVIDER ── */
  .hp-divider { border: none; border-top: 1px solid var(--bdr); }

  /* ── SECTION LABEL ── */
  .hp-label {
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--teal);
    display: flex; align-items: center; gap: 0.5rem;
  }
  .hp-label::before {
    content: ''; display: inline-block;
    width: 18px; height: 2px;
    background: var(--teal);
    border-radius: 2px;
  }

  /* ── SECTION TITLE ── */
  .hp-section-title {
    font-family: 'Playfair Display', serif;
    font-style: italic; font-weight: 700;
    font-size: clamp(2rem, 5vw, 3.2rem);
    color: var(--txt1); line-height: 1.15;
  }

  /* ── STAT BOX ── */
  .hp-stat-box {
    background: var(--bg2); border: 1px solid var(--bdr);
    border-radius: 16px; padding: 1.5rem 2rem;
    transition: border-color 0.3s;
  }
  .hp-stat-box:hover { border-color: var(--bdr-h); }
  .hp-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 2.4rem; font-weight: 700; color: var(--amb);
    line-height: 1;
    text-shadow: 0 0 20px rgba(245,166,35,0.3);
  }
  .hp-stat-lbl {
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 0.78rem; font-weight: 600; color: var(--txt2);
    margin-top: 0.3rem; letter-spacing: 0.05em;
  }

  /* ── COLLECTION COUNT PILL ── */
  .hp-count-pill {
    display: inline-flex; align-items: center;
    background: rgba(245,166,35,0.15);
    border: 1px solid rgba(245,166,35,0.3);
    color: var(--amb);
    border-radius: 100px; padding: 0.3rem 0.9rem;
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em;
    margin-top: 0.75rem;
    box-shadow: 0 0 20px rgba(245,166,35,0.12);
  }

  /* ── INPUT FOCUS RING ── */
  input:focus { outline: none; }
  textarea:focus { outline: none; }

  /* ── CUSTOM CURSOR REMOVED ── */
  a, button, .hp-card, .hp-col-card, .spotlight-card, .hp-btn-primary, .hp-btn-ghost, .hp-filter-tab { cursor: pointer !important; }
  input, textarea { cursor: text !important; }


  /* ── SPOTLIGHT CINEMA ── */
  .spotlight-section {
    padding: 8rem 0;
    position: relative;
    overflow: hidden;
    background: #000;
  }

  .spotlight-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle at center, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .spotlight-card {
    position: relative;
    min-width: 420px;
    height: 580px;
    border-radius: 40px;
    overflow: hidden;
    cursor: pointer;
    background: #030303;
    transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 1s var(--nc-easing);
    border: 1px solid rgba(255, 255, 255, 0.05);
    flex-shrink: 0;
    perspective: 2000px;
    transform-style: preserve-3d;
  }

  .spotlight-card:hover {
    border-color: rgba(0, 240, 255, 0.4);
    box-shadow: 0 50px 120px rgba(0, 0, 0, 1), 0 0 30px rgba(0, 240, 255, 0.1);
    z-index: 10;
  }

  .spotlight-shine {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(600px circle at 0px 0px, rgba(255,255,255,0.12), transparent 80%);
    pointer-events: none;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.5s;
    mix-blend-mode: overlay;
  }

  .spotlight-card:hover .spotlight-shine {
    opacity: 1;
  }

  .spotlight-img-wrap {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: inherit;
    transform: translateZ(20px);
  }

  .spotlight-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    filter: brightness(0.9) contrast(1.1);
  }

  .spotlight-card:hover .spotlight-img {
    transform: scale(1.15);
  }

  .spotlight-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
    transition: opacity 0.5s;
    transform: translateZ(30px);
  }

  .spotlight-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 40px;
    z-index: 5;
    transform: translateY(20px) translateZ(50px);
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .spotlight-card:hover .spotlight-info {
    transform: translateY(0) translateZ(50px);
  }

  .spotlight-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .spotlight-tag {
    font-size: 0.7rem;
    font-weight: 800;
    color: #FFF;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 6px 14px;
    border-radius: 100px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .spotlight-title {
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 2.2rem;
    color: #FFF;
    letter-spacing: -0.05em;
    line-height: 0.95;
    text-transform: uppercase;
  }

  .spotlight-actions {
    display: flex;
    gap: 12px;
    margin-top: 15px;
    opacity: 0;
    transform: translateY(10px) translateZ(60px);
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s;
  }

  .spotlight-card:hover .spotlight-actions {
    opacity: 1;
    transform: translateY(0) translateZ(60px);
  }

  .btn-spotlight {
    flex: 1;
    padding: 14px;
    border-radius: 100px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-family: 'Cabinet Grotesk', sans-serif;
  }

  .btn-spotlight-ghost {
    background: rgba(255, 255, 255, 0.05);
    color: #FFF;
    backdrop-filter: blur(10px);
  }

  .btn-spotlight-ghost:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .btn-spotlight-solid {
    background: #FFF;
    color: #000;
  }

  .btn-spotlight-solid:hover {
    background: #E4E4E7;
    transform: scale(1.02);
  }

  .spotlight-shine {
    position: absolute;
    top: -100%;
    left: -100%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
    pointer-events: none;
    z-index: 4;
    transition: transform 0s;
    transform: translateZ(40px);
  }

  .spotlight-card:hover .spotlight-shine {
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

`;

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const FILTERS = ["ALL", "LANDSCAPE", "PORTRAIT", "ABSTRACT", "ARCHITECTURE", "MACRO", "CINEMATIC", "SPACE"];
const AI_MODELS = ["Midjourney V6", "Midjourney V5.2", "DALL-E 3", "Stable Diffusion XL", "Leonardo.ai", "Adobe Firefly", "Magnific AI"];
const MARQUEE_ITEMS = ["CINEMATIC LONG SHOT", "HYPER REALISTIC", "SOFT BOKEH", "CONCEPT ART", "EDITORIAL PHOTOGRAPHY", "NEON NOIR", "BRUTALIST ARCHITECTURE", "MACRO DETAIL", "WIDE ANGLE", "FILM GRAIN", "8K RESOLUTION", "AWARD-WINNING"];

/* ─────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────── */
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.classList.add("visible");
    }, { threshold: 0.07 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg = "Copied!") => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);
  return [toast, show];
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function Stars({ rating = 5 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? "hp-star" : "hp-star-dim"}>★</span>
      ))}
    </span>
  );
}

function Badge({ type = "pick", children }) {
  const cls = { hot: "hp-badge-hot", new: "hp-badge-new", pick: "hp-badge-pick" }[type] || "hp-badge-pick";
  return <span className={`hp-badge ${cls}`}>{children}</span>;
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="hp-toast">
      <div className="hp-toast-status">Notification</div>
      <div className="hp-toast-msg">{msg}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <Check size={14} color="#FFF" />
      </div>
      <div className="hp-toast-progress" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MARQUEE
───────────────────────────────────────────── */
function Marquee() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="hp-marquee-wrap">
      <div className="hp-marquee-track">
        {doubled.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "1.2rem" }}>
            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "var(--txt3)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              {item}
            </span>
            <span style={{ display: "inline-block", width: 4, height: 4, background: "var(--amb)", borderRadius: "50%", opacity: 0.5 }} />
          </span>
        ))}
      </div>
    </div>
  );
}



/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero({ totalCount }) {
  const [mPos, setMPos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    setMPos({ x: (e.clientX / window.innerWidth - 0.5) * 40, y: (e.clientY / window.innerHeight - 0.5) * 40 });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      style={{
        paddingTop: "190px", paddingBottom: "10rem", position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        overflow: "hidden", background: "var(--bg1)"
      }}>
      {/* ── DYNAMIC ATMOSPHERE ── */}
      <div className="hp-hero-glow" style={{ opacity: 0.6 }} />
      <div className="hp-orb" style={{
        width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08), transparent 70%)',
        top: '-20%', left: '-10%', transform: `translate(${mPos.x * 0.8}px, ${mPos.y * 0.8}px)`, transition: 'transform 0.15s ease-out'
      }} />
      <div className="hp-orb" style={{
        width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05), transparent 70%)',
        bottom: '0%', right: '-5%', transform: `translate(${-mPos.x * 1.2}px, ${-mPos.y * 1.2}px)`,
        animationDelay: '-5s', transition: 'transform 0.15s ease-out'
      }} />

      {/* ── FLOATING CHIPS (Neo-Chrome Decor) ── */}
      <div style={{ position: 'absolute', top: '25%', left: '15%', animation: 'float 6s infinite alternate ease-in-out', zIndex: 1, pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,240,255,0.2)', padding: '8px 16px', borderRadius: '100px', backdropFilter: 'blur(10px)', fontSize: '0.7rem', fontWeight: 800, color: 'var(--nc-neon-cyan)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Prompt</div>
      </div>
      <div style={{ position: 'absolute', top: '40%', right: '12%', animation: 'float 8s infinite alternate-reverse ease-in-out', zIndex: 1, pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.2)', padding: '8px 16px', borderRadius: '100px', backdropFilter: 'blur(10px)', fontSize: '0.7rem', fontWeight: 800, color: 'var(--nc-neon-purple)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Generator Free</div>
      </div>

      <div className="hp-hero-inner" style={{ position: "relative", zIndex: 2, maxWidth: "1200px", margin: "0 auto", padding: "0 2rem", width: "100%" }}>
        {/* EyeBrow */}
        <div style={{ animation: "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both", animationDelay: "0s", marginBottom: "2.5rem" }}>
          <span className="hp-hero-badge" style={{
            fontSize: "0.68rem", letterSpacing: "0.35em", textTransform: "uppercase",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            padding: "0.75rem 2rem", borderRadius: '100px', color: 'rgba(255,255,255,0.6)',
            fontWeight: 800, backdropFilter: 'blur(12px)'
          }}>
            State-of-the-art Prompt Studio
          </span>
        </div>

        {/* Headline */}
        <div style={{ animation: "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both", animationDelay: "0.15s", marginBottom: "2rem" }}>
          <h1 className="hp-hero-title" style={{ fontSize: 'clamp(3rem, 10vw, 7.5rem)', lineHeight: 0.95, letterSpacing: '-0.06em' }}>
            Infinite Vision.<br />
            <span style={{
              background: 'linear-gradient(to right, #FFF, rgba(255,255,255,0.4))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'none'
            }}>Curated </span>
            <span style={{ color: "transparent", WebkitTextStroke: "1px rgba(0,240,255,0.8)", filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.3))' }}>Prompts.</span>
          </h1>
        </div>

        {/* Sub text */}
        <div style={{ animation: "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both", animationDelay: "0.3s", marginBottom: "4rem" }}>
          <p style={{
            fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 500, fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
            color: "rgba(255,255,255,0.55)", lineHeight: 1.5, maxWidth: "800px", margin: "0 auto"
          }}>
            Enter a digital vault where cinematic aesthetics meet next-gen AI.
            Discover, curate, and deploy professional prompts for world-class visual generation.
          </p>
        </div>

        {/* Actions */}
        <div className="hp-hero-actions" style={{ animation: "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both", animationDelay: "0.4s", display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '6rem' }}>
          <button className="hp-btn-primary" style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem', borderRadius: '15px' }}>Open Studio ✦</button>
          <button className="hp-btn-ghost" style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem', borderRadius: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>Discovery Mode</button>
        </div>

        {/* ── PREMIUM STATS DASHBOARD ── */}
        <div className="hp-hero-stats" style={{
          animation: "fadeUp 1.2s ease both", animationDelay: "0.6s",
          background: 'rgba(5,5,5,0.4)',
          backdropFilter: 'blur(20px)',
          borderRadius: '35px', padding: '4rem 2rem',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'center', gap: '6rem',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
          position: 'relative', width: '100%', maxWidth: '1100px'
        }}>
          {/* Subtle grid pattern inside stats */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#FFF 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />

          {[
            [totalCount || "18K", "PROMPTS"],
            ["480+ ", "CREATORS"],
            ["100%", "PRECISION"]
          ].map(([val, lbl], i) => (
            <div key={i} style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div className="stat-val" style={{ fontSize: '4.5rem', fontWeight: 950, letterSpacing: '-0.05em', background: 'linear-gradient(to bottom, #FFF, #71717A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{val}</div>
              <div className="stat-lbl" style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--nc-neon-cyan)', letterSpacing: '0.25em', marginTop: '0.85rem', textTransform: 'uppercase' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Divider */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '1px', height: '100px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)'
      }} />
    </section >
  );
}


/* ─────────────────────────────────────────────
   SEARCH BAR
───────────────────────────────────────────── */


/* ─────────────────────────────────────────────
   PROMPT CARD
───────────────────────────────────────────── */
function PromptCard({ data, index, onOpen, onCopy, onAuthRequired, className = "hp-masonry-item" }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { token } = useAuth();
  const liked = isInWishlist(data._id || data.id);
  const getBadgeLabel = (i) => {
    if (i === 0) return "TRENDING";
    if (i % 5 === 0) return "NEW ARRIVAL";
    if (i % 3 === 0) return "FEATURED";
    return "STYLISH";
  };

  const badgeLabel = getBadgeLabel(index);
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const category = tags[0] || "Generative Art";

  return (
    <div className={`${className} hp-fade visible`} style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="hp-card" onClick={() => onOpen(data)}>
        {/* Top Accent */}
        <div className="hp-card-accent-bar" />

        {/* Image Zone */}
        <div className="hp-card-img-zone">
          <img src={data.imageUrl} className="hp-card-img" alt={data.title} loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400"; }} />
          <div className="hp-card-scrim" />
        </div>

        {/* Floating Badges */}
        <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', zIndex: 10 }}>
          <div className="hp-badge-f" style={{
            position: 'static', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)', fontSize: '0.65rem', padding: '6px 12px', borderRadius: '4px'
          }}>{badgeLabel}</div>
          <div className={`hp-meta-badge ${data.priority === 'High' ? 'priority-high' : data.priority === 'Medium' ? 'priority-med' : 'priority-low'}`}
            style={{ fontSize: '0.62rem', letterSpacing: '0.12em', fontWeight: 900, textTransform: 'uppercase', borderRadius: '4px' }}>
            {data.priority || 'Normal'}
          </div>
        </div>


        <button
          className={`hp-likes-pill ${liked ? 'liked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!token) {
              onAuthRequired();
              return;
            }
            toggleWishlist(data);
          }}
        >
          {liked ? "❤️" : "♡"} {liked ? (24 + index * 5) + 1 : 24 + index * 5}
        </button>

        {/* Model Chip */}
        <div>
          {data.modelName}
        </div>

        {/* Bottom Content Row */}
        <div className="hp-card-content">
          <div className="hp-category-label">
            <div className="hp-category-line" />
            {category}
          </div>

          <h3 className={`hp-card-title-p ${index === 0 ? 'large' : ''}`}>
            {data.title || "Untitled Creation"}
          </h3>

          <p className="hp-excerpt">
            {data.prompt || "Explore this specialized AI-generated visual prompt for high-fashion aesthetics."}
          </p>

          <footer className="hp-card-footer">
            <div className="hp-author">
              <img
                src={data.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${data.id || index}`}
                className="hp-author-img"
                alt="Author"
              />
              <span className="hp-author-name">{data.authorName || "AI Artisan"}</span>
            </div>

            <div className="hp-btn-row">
              <button className="hp-btn-s-ghost" onClick={(e) => { e.stopPropagation(); onOpen(data); }}>View</button>
              <button className="hp-btn-s-solid" onClick={(e) => { e.stopPropagation(); onCopy(data.prompt); }}>Prompt</button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   GALLERY GRID
───────────────────────────────────────────── */
function GalleryGrid({ prompts, onOpen, onCopy, onAuthRequired }) {
  const ref = useFadeIn();
  return (
    <div ref={ref} className="hp-fade hp-gallery-wrap" style={{ padding: "2rem 2.5rem 6rem", maxWidth: 1320, margin: "0 auto" }}>
      <div className="hp-masonry">
        {prompts.map((p, i) => (
          <PromptCard key={p._id || p.id} data={p} index={i} onOpen={onOpen} onCopy={onCopy} onAuthRequired={onAuthRequired} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TRENDING SLIDER
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   UPLOAD VIEW
 ───────────────────────────────────────────── */
function ModelSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener("mousedown", fn);
    return () => window.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: "var(--bg3)", border: `1px solid ${open ? "var(--primary)" : "var(--bdr)"}`,
          padding: "1rem", borderRadius: 12, color: "#FFF", textAlign: "left",
          display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
          transition: "all 0.3s var(--easing)", outline: "none"
        }}
      >
        <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{value}</span>
        <div style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
          <Compass size={16} color="var(--txt3)" />
        </div>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
          background: "#0F0F0F", border: "1px solid var(--bdr)", borderRadius: 12,
          boxShadow: "0 16px 40px rgba(0,0,0,0.6)", zIndex: 100, overflow: "hidden",
          animation: "fadeUp 0.25s var(--easing)"
        }}>
          {AI_MODELS.map(m => (
            <div
              key={m}
              onClick={() => { onChange(m); setOpen(false); }}
              style={{
                padding: "0.9rem 1.2rem", fontSize: "0.85rem", color: m === value ? "var(--txt1)" : "var(--txt2)",
                background: m === value ? "rgba(255,255,255,0.06)" : "transparent",
                cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.03)",
                transition: "all 0.2s"
              }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseOut={e => e.currentTarget.style.background = m === value ? "rgba(255,255,255,0.06)" : "transparent"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: m === value ? "#FFF" : "transparent" }} />
                {m}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadView({ onBack }) {
  const ref = useFadeIn();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    tags: [],
    category: "FASHION",
    modelName: "Select Model",
    issueType: "Task",
    assignee: "",
    priority: "Medium",
    dueDate: ""
  });

  const onFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setImageUrlInput("");
      setPreview(URL.createObjectURL(f));
    }
  };

  // Auto-populate preview when a URL is typed/pasted
  const onImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrlInput(url);
    if (url.trim()) {
      setFile(null); // clear file if URL is provided
      setPreview(url.trim());
    } else {
      setPreview(null);
    }
  };

  const resetImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setImageUrlInput("");
  };

  const addTag = (val) => {
    const t = val.trim().replace(/#/g, '');
    if (t && !formData.tags.includes(t)) {
      setFormData({ ...formData, tags: [...formData.tags, t] });
    }
    setTagInput("");
  };

  const removeTag = (t) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== t) });
  };

  const { token } = useAuth();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.title) return alert("Please fill in the title.");
    if (!file && !imageUrlInput.trim()) return alert("Please select an image file or enter an Image URL.");

    setUploading(true);
    try {
      let imageUrl = imageUrlInput.trim();

      // Only upload file if no URL was provided
      if (file && !imageUrl) {
        const uploadData = new FormData();
        uploadData.append("image", file);
        const uploadRes = await axios.post(`${config.API_BASE_URL}/api/upload`, uploadData);
        imageUrl = uploadRes.data.imageUrl;
      }

      const payload = {
        title: formData.title,
        prompt: formData.prompt,
        imageUrl,
        category: formData.category,
        modelName: formData.modelName,
        tags: formData.tags,
        issueType: formData.issueType,
        assignee: formData.assignee,
        priority: formData.priority,
        dueDate: formData.dueDate
      };

      await axios.post(`${config.API_BASE_URL}/category`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Successfully published!");
      onBack();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Please login first to upload prompts.");
      } else {
        alert("Upload failed. " + (err.response?.data?.error || "Check console."));
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <section ref={ref} className="hp-fade hp-upload-section" style={{ padding: "4rem 2.5rem 8rem", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: "3.5rem" }}>
        <button onClick={onBack} className="hp-btn-ghost" style={{ marginBottom: "1.5rem" }}>← Back to Discover</button>
        <h1 className="hp-upload-title" style={{
          fontFamily: "'Cabinet Grotesk', sans-serif",
          fontWeight: 800, fontSize: "3.5rem", letterSpacing: "-0.03em", color: "var(--txt1)"
        }}>
          Create New Prompt
        </h1>
        <p style={{ color: "var(--txt2)", fontSize: "1.1rem" }}>Share your AI-generated fashion masterpieces with the world.</p>
      </div>

      <form onSubmit={handleUpload} className="hp-upload-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "3rem" }}>
        {/* Left: Upload Area */}
        <div>
          <label className="hp-upload-zone" style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            height: 320, border: "2px dashed var(--bdr)", borderRadius: 32, cursor: "pointer",
            background: "rgba(255,255,255,0.02)", transition: "all 0.3s", overflow: "hidden", position: "relative"
          }}>
            <input type="file" hidden onChange={onFileSelect} accept="image/*" id="hp-file-input" />
            {preview ? (
              <div style={{ width: "100%", height: "100%", position: "relative" }}>
                <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Preview"
                  onError={e => { e.target.onerror = null; setPreview(null); }}
                />
                <button
                  type="button"
                  onClick={resetImage}
                  style={{
                    position: "absolute", top: "1rem", right: "1rem",
                    background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)",
                    width: 40, height: 40, borderRadius: "50%", color: "#FFF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", backdropFilter: "blur(10px)", transition: "all 0.2s"
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "rgba(220, 38, 38, 0.8)"}
                  onMouseOut={e => e.currentTarget.style.background = "rgba(0,0,0,0.6)"}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📸</div>
                <p style={{ fontWeight: 600, color: "var(--txt1)" }}>Click to browse or drop file</p>
                <p style={{ fontSize: "0.85rem", color: "var(--txt3)", marginTop: "0.5rem" }}>Supports JPG, PNG, WEBP (Max 10MB)</p>
              </div>
            )}
          </label>

          {/* IMAGE URL INPUT */}
          <div style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.08em" }}>Image URL</label>
            <input
              type="url"
              value={imageUrlInput}
              onChange={onImageUrlChange}
              placeholder="https://..."
              style={{
                width: "100%", background: "var(--bg3)", border: "1px solid var(--bdr)",
                padding: "0.9rem 1rem", borderRadius: 12, color: "#FFF",
                fontSize: "0.9rem", outline: "none", transition: "border-color 0.2s",
                fontFamily: "'Cabinet Grotesk', sans-serif",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                display: "block"
              }}
              onFocus={e => e.target.style.borderColor = "var(--primary)"}
              onBlur={e => e.target.style.borderColor = "var(--bdr)"}
            />
            {imageUrlInput && (
              <div style={{
                fontSize: "0.72rem", color: "var(--txt3)", marginTop: "0.4rem",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                maxWidth: "100%", fontFamily: "'Cabinet Grotesk', sans-serif"
              }}>
                🔗 {imageUrlInput}
              </div>
            )}
            <p style={{ fontSize: "0.72rem", color: "var(--txt3)", marginTop: "0.3rem" }}>Paste a URL — preview auto-loads above. Or click the zone to upload a file.</p>
          </div>
        </div>

        {/* Right: Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", marginBottom: "0.6rem" }}>Concept Title</label>
            <input
              className="hp-upload-input"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Victorian Cyberpunk T-Shirt"
              style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--bdr)", padding: "1rem", borderRadius: 12, color: "#FFF" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", marginBottom: "0.6rem" }}>Full Design Prompt</label>
            <textarea
              className="hp-upload-input"
              value={formData.prompt}
              onChange={e => setFormData({ ...formData, prompt: e.target.value })}
              placeholder="Enter the AI prompt used to generate this image..."
              style={{ width: "100%", height: 160, background: "var(--bg3)", border: "1px solid var(--bdr)", padding: "1rem", borderRadius: 12, color: "#FFF", resize: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", marginBottom: "0.6rem" }}>Hashtags</label>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "0.75rem",
              background: "var(--bg3)", border: "1px solid var(--bdr)", borderRadius: 12
            }}>
              {formData.tags.map(t => (
                <span key={t} style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.08)",
                  padding: "0.35rem 0.8rem", borderRadius: "100px", fontSize: "0.85rem", color: "var(--txt1)",
                  fontWeight: 500, animation: "fadeIn 0.2s ease"
                }}>
                  #{t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    style={{
                      background: "rgba(255,255,255,0.1)", border: "none",
                      color: "var(--txt1)", cursor: "pointer",
                      width: 18, height: 18, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s", marginLeft: "2px"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                    onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                  >
                    <X size={10} strokeWidth={3} />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder={formData.tags.length === 0 ? "Add tags (press Enter)..." : ""}
                style={{ flex: 1, minWidth: 100, background: "none", border: "none", color: "#FFF", outline: "none", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          <div className="hp-upload-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", marginBottom: "0.6rem" }}>Issue Type</label>
              <select
                style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--bdr)", padding: "1rem", borderRadius: 12, color: "#FFF", outline: "none" }}
                value={formData.issueType}
                onChange={e => setFormData({ ...formData, issueType: e.target.value })}
              >
                {["Task", "Bug", "Feature", "Project"].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", marginBottom: "0.6rem" }}>Priority</label>
              <select
                style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--bdr)", padding: "1rem", borderRadius: 12, color: "#FFF", outline: "none" }}
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
              >
                {["Low", "Medium", "High"].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="hp-upload-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", marginBottom: "0.6rem" }}>Assignee</label>
              <input
                className="hp-upload-input"
                value={formData.assignee}
                onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                placeholder="Name"
                style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--bdr)", padding: "1rem", borderRadius: 12, color: "#FFF" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", marginBottom: "0.6rem" }}>Due Date</label>
              <input
                type="date"
                className="hp-upload-input"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--bdr)", padding: "1rem", borderRadius: 12, color: "#FFF" }}
              />
            </div>
          </div>

          <div className="hp-upload-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", marginBottom: "0.6rem" }}>Category</label>
              <select
                style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--bdr)", padding: "1rem", borderRadius: 12, color: "#FFF", outline: "none" }}
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {FILTERS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", marginBottom: "0.6rem" }}>AI Model</label>
              <ModelSelector
                value={formData.modelName}
                onChange={m => setFormData({ ...formData, modelName: m })}
              />
            </div>
          </div>


          <button
            type="submit"
            disabled={uploading}
            className="hp-btn-upload-submit"
            style={{
              width: "100%", padding: "1.2rem", fontSize: "1rem", marginTop: "1rem",
              background: "linear-gradient(135deg, #FFFFFF 0%, #E2E2E2 100%)",
              color: "#000", border: "none", borderRadius: "100px", fontWeight: 700,
              cursor: "pointer", transition: "all 0.3s var(--easing)",
              boxShadow: "0 0 20px rgba(255,255,255,0.1)"
            }}
          >
            {uploading ? "Publishing Masterpiece..." : "Publish to Gallery"}
          </button>
        </div>
      </form>
    </section>
  );
}

function TrendingView({ prompts, onOpen, onCopy, onAuthRequired }) {
  const ref = useFadeIn();
  // Using the same prompts but focused on trending
  return (
    <section ref={ref} className="hp-fade" style={{ padding: "4rem 2.5rem 8rem", maxWidth: 1320, margin: "0 auto" }}>
      <div style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 style={{
          fontFamily: "'Cabinet Grotesk', sans-serif",
          fontWeight: 800, fontSize: "clamp(3rem, 7vw, 4.5rem)", letterSpacing: "-0.03em",
          color: "var(--txt1)", lineHeight: 1.05, marginBottom: "1.2rem"
        }}>
          Trending Prompts
        </h1>
        <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", color: "var(--txt2)", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>
          The most inspiring fashion concepts trending in the community right now.
        </p>
      </div>

      <GalleryGrid prompts={prompts} onOpen={onOpen} onCopy={onCopy} onAuthRequired={onAuthRequired} />
    </section>
  );
}

function SpotlightCinema({ prompts, onOpen, onViewAll }) {
  const ref = useFadeIn();
  const sliderRef = useRef(null);
  const scrollPos = useRef(0);
  const [items, setItems] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (prompts && prompts.length > 0) {
      setItems([...prompts, ...prompts]);
    }
  }, [prompts]);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el || items.length === 0 || isHovered) return;

    let request;
    const animate = () => {
      scrollPos.current += 1.2; // faster scroll for better motion
      if (scrollPos.current >= el.scrollWidth / 2) {
        scrollPos.current = 0;
      }
      el.scrollLeft = scrollPos.current;
      request = requestAnimationFrame(animate);
    };

    request = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(request);
  }, [items, isHovered]);

  const handleMouseMove = (e, cardEl) => {
    const rect = cardEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 12; // much stronger tilt for deep depth
    const rotateY = (centerX - x) / 12;

    cardEl.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-30px) scale(1.08)`;

    const shine = cardEl.querySelector('.spotlight-shine');
    if (shine) {
      shine.style.opacity = '1';
      shine.style.transform = `translate(${x - rect.width}px, ${y - rect.height}px)`;
      // Add liquid shimmer light-leak effect
      shine.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.15), transparent 80%)`;
    }
  };

  const handleMouseLeave = (cardEl) => {
    cardEl.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)`;
  };

  if (!prompts || prompts.length === 0) return null;

  return (
    <div ref={ref} className="hp-fade spotlight-section">
      <div className="spotlight-glow" />

      <div className="hp-spotlight-header" style={{ padding: "0 2.5rem 4rem", maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative", zIndex: 5, flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ width: "40px", height: "1px", background: "rgba(255,255,255,0.3)" }} />
            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#FFF", letterSpacing: "0.4em", textTransform: "uppercase", opacity: 0.6 }}>The Curated List</span>
          </div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(2.5rem, 8vw, 5.5rem)", color: "#FFF", letterSpacing: "-0.05em", lineHeight: 0.9 }}>
            SPOTLIGHT<br /><span style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>GALLERY</span>
          </h2>
        </div>
        <button
          onClick={onViewAll}
          className="hp-btn-ghost"
          style={{
            padding: "1rem 2rem",
            borderRadius: "100px",
            fontSize: "0.8rem",
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.1)"
          }}
        >
          View All Discoveries
        </button>
      </div>

      <div
        ref={sliderRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: "flex", gap: "2.5rem", overflowX: "hidden",
          padding: "2rem 2.5rem 6rem", position: "relative", zIndex: 1
        }}
      >
        {items.map((cat, i) => (
          <div
            key={i}
            className="spotlight-card"
            onClick={() => onOpen(cat)}
            onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
            onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
          >
            <div className="spotlight-shine" />
            <div className="spotlight-img-wrap">
              <img src={cat.imageUrl} className="spotlight-img" alt={cat.title} onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400"; }} />
            </div>
            <div className="spotlight-overlay" />

            <div className="spotlight-info">
              <div className="spotlight-meta">
                <span className="spotlight-tag">{cat.tags?.[0] || 'Aesthetic'}</span>
                <Stars rating={5} />
              </div>
              <h3 className="spotlight-title">{cat.title}</h3>

              <div className="spotlight-actions" onClick={(e) => e.stopPropagation()}>
                <button className="btn-spotlight btn-spotlight-ghost" onClick={() => onOpen(cat)}>View Design</button>
                <button className="btn-spotlight btn-spotlight-solid" onClick={() => onOpen(cat)}>Get Prompt</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COLLECTIONS VIEW
───────────────────────────────────────────── */
function CollectionsView({ prompts, onSelectCollection, query }) {
  const ref = useFadeIn();
  const collections = useMemo(() => {
    if (!Array.isArray(prompts)) return [];
    const groups = {};
    prompts.forEach(p => {
      const pTags = Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ["GENERAL"];
      pTags.forEach(tag => {
        const t = tag.toUpperCase().replace("#", "").trim();
        if (!t) return;
        if (!groups[t]) groups[t] = { name: t, raw: tag, items: [], cover: p.imageUrl };
        groups[t].items.push(p);
      });
    });
    return Object.values(groups)
      .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.items.length - a.items.length);
  }, [prompts, query]);

  return (
    <section ref={ref} className="hp-fade" style={{ padding: "0 2.5rem 8rem", maxWidth: 1320, margin: "0 auto" }}>
      <div className="hp-collections-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "2.5rem" }}>
        {collections.map((col, i) => (
          <div
            key={col.name}
            className="hp-col-card"
            onClick={() => onSelectCollection(col.raw)}
            style={{ animationDelay: `${i * 0.07}s`, height: '450px' }}
          >
            <img src={col.cover} alt={col.name} />
            <div className="hp-col-overlay">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'auto' }}>
                <span className="hp-chip" style={{ background: 'var(--nc-neon-cyan)', color: '#000', fontWeight: 900 }}>{col.items.length} ASSETS</span>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', backdropFilter: 'blur(10px)' }}>
                  <Bookmark size={18} color="white" />
                </div>
              </div>
              <h3 style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontWeight: 900, fontSize: "2.5rem", color: "white", lineHeight: 1, letterSpacing: '-0.04em', textShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}>
                {col.name.replace(/_/g, " ")}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 500 }}>Explore {col.items.length} curated prompts in this collection.</p>
              <div className="hp-count-pill" style={{ marginTop: '1.5rem', alignSelf: 'flex-start' }}>View Collection →</div>
            </div>
          </div>
        ))}
      </div>
      {collections.length === 0 && (
        <div style={{ textAlign: "center", padding: "8rem 0" }}>
          <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", color: "var(--txt3)", fontSize: "1.1rem", letterSpacing: "0.1em" }}>
            No collections found. Curate your first asset to start.
          </p>
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────
   WISHLIST VIEW
───────────────────────────────────────────── */
function WishlistView({ onOpen, onCopy }) {
  const { wishlist } = useWishlist();
  const ref = useFadeIn();

  return (
    <section ref={ref} className="hp-fade" style={{ padding: "4rem 2.5rem 8rem", maxWidth: 1320, margin: "0 auto" }}>
      <div style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 style={{
          fontFamily: "'Cabinet Grotesk', sans-serif",
          fontWeight: 800, fontSize: "clamp(3rem, 7vw, 4.5rem)", letterSpacing: "-0.03em",
          color: "var(--txt1)", lineHeight: 1.05, marginBottom: "1.2rem"
        }}>
          My Wishlist
        </h1>
        <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", color: "var(--txt2)", fontSize: "1rem", maxWidth: 500, margin: "0 auto" }}>
          Your curated collection of inspiring prompts and visual masterpieces.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem 0", background: "rgba(255,255,255,0.02)", borderRadius: "24px", border: "1px dashed var(--bdr)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1.5rem", opacity: 0.3 }}>✧</div>
          <h3 style={{ color: "var(--txt1)", marginBottom: "0.5rem" }}>Your wishlist is empty</h3>
          <p style={{ color: "var(--txt3)", fontSize: "0.9rem" }}>Start exploring the gallery to save your favorite prompts.</p>
        </div>
      ) : (
        <div className="hp-masonry">
          {wishlist.map((p, i) => (
            <PromptCard key={p._id || p.id} data={p} index={i} onOpen={onOpen} onCopy={onCopy} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────
   MODAL
───────────────────────────────────────────── */
function PromptModal({ data, onClose, onCopy, onAuthRequired }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { token, adminToken } = useAuth();
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  if (!data) return null;
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const liked = isInWishlist(data._id || data.id);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this prompt?")) return;
    try {
      await axios.delete(`${config.API_BASE_URL}/category/${data._id || data.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      alert("Prompt deleted successfully");
      window.location.reload();
    } catch (err) {
      alert("Failed to delete: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="hp-modal-backdrop" onClick={onClose} style={{ zIndex: 30000 }}>
      <div className="hp-modal-box" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "1.25rem", right: "1.25rem",
            background: "var(--bg3)", border: "1px solid var(--bdr)",
            color: "var(--txt2)", cursor: "pointer", zIndex: 10,
            width: 24, height: 24, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", transition: "all 0.2s",
          }}
          onMouseOver={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseOut={e => { e.currentTarget.style.background = "var(--bg3)"; e.currentTarget.style.color = "var(--txt2)"; }}
        >×</button>

        {/* Image Panel */}
        <div className="hp-modal-img-panel" style={{ position: "relative", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <img src={data.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={data.title} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.9) 100%)" }} />
          <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem" }}>
            <Stars rating={4} />
          </div>
        </div>

        {/* Info Panel */}
        <div className="hp-modal-info" style={{ padding: "3rem 2.5rem", overflowY: "auto", display: "flex", flexDirection: "column", background: "var(--bg2)" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span className="hp-label">Prompt Detail</span>
            {adminToken && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleDelete}
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
                >DELETE</button>
              </div>
            )}
          </div>

          <h2 style={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontWeight: 800, fontSize: "2rem", color: "var(--txt1)",
            marginBottom: "1rem", lineHeight: 1.15, letterSpacing: "-0.02em"
          }}>
            {data.title || "Untitled Creation"}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <img
                src={data.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${data.id || data.title}`}
                alt="Creator"
                style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg3)", objectFit: "cover" }}
              />
              <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--txt1)" }}>
                {data.authorName || "AI Creator"}
              </span>
            </div>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--txt3)" }} />
            <div style={{
              fontSize: "0.8rem", fontWeight: 600, color: "var(--txt2)",
              background: "rgba(255,255,255,0.08)", padding: "0.3rem 0.8rem",
              borderRadius: "100px", border: "1px solid rgba(255,255,255,0.05)"
            }}>
              {data.modelName || tags[0] || "Midjourney"}
            </div>
          </div>

          {/* Prompt text */}
          <div style={{
            background: "var(--bg4)", border: "1px solid var(--bdr)",
            borderRadius: 12, padding: "1.35rem",
            marginBottom: "1.5rem"
          }}>
            <p style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: "0.9rem", color: "var(--txt2)", lineHeight: 1.75, fontWeight: 400
            }}>
              {data.prompt || "No prompt data available."}
            </p>
          </div>

          {/* Metadata Grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem",
            background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "1.5rem",
            marginBottom: "2rem", border: "1px solid rgba(255,255,255,0.05)"
          }}>
            <div>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "var(--txt3)", textTransform: "uppercase", marginBottom: "4px" }}>Issue Type</label>
              <span style={{ fontSize: "0.85rem", color: "var(--txt1)", fontWeight: 600 }}>{data.issueType || "Project"}</span>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "var(--txt3)", textTransform: "uppercase", marginBottom: "4px" }}>Priority</label>
              <span className={`hp-meta-badge ${data.priority === 'High' ? 'priority-high' : data.priority === 'Medium' ? 'priority-med' : 'priority-low'}`}>
                {data.priority || "Medium"}
              </span>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "var(--txt3)", textTransform: "uppercase", marginBottom: "4px" }}>Assignee</label>
              <span style={{ fontSize: "0.85rem", color: "var(--txt1)", fontWeight: 600 }}>{data.assignee || "Unassigned"}</span>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "var(--txt3)", textTransform: "uppercase", marginBottom: "4px" }}>Due Date</label>
              <span style={{ fontSize: "0.85rem", color: "var(--txt1)", fontWeight: 600 }}>{data.dueDate ? new Date(data.dueDate).toLocaleDateString() : "No Deadline"}</span>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              {tags.map(t => (
                <span key={t} className="hp-chip" style={{ fontSize: "0.72rem", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 6 }}>{t}</span>
              ))}
            </div>
          )}


          {/* Actions */}
          <div className="hp-modal-actions" style={{ marginTop: "auto", display: "flex", gap: "0.75rem" }}>
            <button
              className="hp-btn-primary"
              style={{ flex: 2, justifyContent: "center", padding: "0.9rem" }}
              onClick={() => onCopy(data.prompt)}
            >
              Copy Prompt ✦
            </button>
            <button
              className={`hp-btn-ghost ${liked ? 'hp-active-pill' : ''}`}
              style={{ flex: 1, padding: "0.9rem", justifyContent: "center", position: 'relative' }}
              onClick={() => {
                if (!token && !adminToken) {
                  onAuthRequired();
                  return;
                }
                toggleWishlist(data);
              }}
            >
              {liked ? "❤️ Heart" : "♡ Save"}
            </button>
            <button
              className="hp-btn-ghost"
              style={{ padding: "0.9rem 1.2rem", justifyContent: "center" }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FEATURED STRIP
───────────────────────────────────────────── */
function AuthModal({ onClose }) {
  const navigate = useNavigate();
  return (
    <div className="hp-modal-backdrop" onClick={onClose} style={{ zIndex: 30000 }}>
      <div className="hp-modal-box" onClick={e => e.stopPropagation()} style={{ gridTemplateColumns: "1fr", maxWidth: "450px", padding: "3rem", textAlign: "center", borderRadius: "32px", background: "rgba(10,10,12,0.95)" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>🔒</div>
        <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "#FFF", marginBottom: "1rem" }}>Login Required</h2>
        <p style={{ color: "var(--txt2)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2.5rem" }}>
          First, sign in to your account to use this feature. Joining propy allows you to curate your personal wishlist and share your creations with the community!
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button
            className="hp-btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "1.1rem" }}
            onClick={() => { onClose(); navigate("/login"); }}
          >
            Sign In to propy
          </button>
          <button
            className="hp-btn-ghost"
            style={{ width: "100%", justifyContent: "center", padding: "1.1rem", border: "none" }}
            onClick={onClose}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

function FeaturedStrip({ data, onOpen, onCopy }) {
  const ref = useFadeIn();
  if (!data) return null;
  return (
    <div ref={ref} className="hp-fade" style={{ padding: "0 1.5rem 6rem", maxWidth: 1320, margin: "0 auto" }}>
      <div className="hp-featured-strip-grid hp-cta-border" style={{
        display: "grid", gridTemplateColumns: "1fr 1.1fr",
        minHeight: 480, overflow: "hidden"
      }}>
        {/* Image */}
        <div className="hp-featured-img" style={{ position: "relative", overflow: "hidden", borderRadius: "19px 0 0 19px", minHeight: 260 }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${data.imageUrl})`,
            backgroundSize: "cover", backgroundPosition: "center",
            transition: "transform 0.5s"
          }} />
          <div className="hp-featured-grad" style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 50%, rgba(5,5,5,0.98) 100%)" }} />
          <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem" }}>
            <Badge type="hot">🔥 Featured Pick</Badge>
          </div>
        </div>

        {/* Info */}
        <div className="hp-featured-info" style={{ padding: "3.5rem 3rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="hp-label" style={{ marginBottom: "1.25rem" }}>Editor's Spotlight</span>

          <h2 style={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontWeight: 800, fontSize: "clamp(1.5rem, 4vw, 3rem)",
            color: "var(--txt1)", lineHeight: 1.1, marginBottom: "1.25rem", letterSpacing: "-0.02em"
          }}>
            {data.title}
          </h2>

          <div style={{
            background: "rgba(0,0,0,0.5)", border: "1px solid var(--bdr)",
            borderRadius: 12, padding: "1.25rem",
            marginBottom: "2rem"
          }}>
            <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "0.88rem", color: "var(--txt2)", lineHeight: 1.7 }}>
              {data.prompt ? data.prompt.slice(0, 200) + (data.prompt.length > 200 ? "…" : "") : "Explore this curated visual."}
            </p>
          </div>

          <div className="hp-featured-actions" style={{ display: "flex", gap: "0.85rem" }}>
            <button className="hp-btn-primary" onClick={() => onCopy(data.prompt)}>Copy Prompt</button>
            <button className="hp-btn-ghost" onClick={() => onOpen(data)}>View Details →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function PromptGallery() {
  const navigate = useNavigate();
  const { token, adminToken } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [authModal, setAuthModal] = useState(false);
  const [view, setView] = useState("GALLERY"); // "GALLERY", "COLLECTIONS", "WISHLIST", "STUDIO", "TRENDING", "UPLOAD"
  const [toast, showToast] = useToast();


  /* Inject global CSS once */
  useEffect(() => {
    const id = "hp-global-styles";
    let el = document.getElementById(id);
    if (!el) { el = document.createElement("style"); el.id = id; document.head.appendChild(el); }
    el.textContent = GLOBAL_CSS;
  }, []);

  /* Fetch data */
  useEffect(() => {
    console.log("Fetching from:", `${config.API_BASE_URL}/category`);
    axios.get(`${config.API_BASE_URL}/category`)
      .then(res => {
        console.log("Success:", res.data);
        setPrompts(res.data);
      })
      .catch(err => {
        console.error("Fetch failed!", err.message);
        console.error("Full Error details:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text || "").catch(() => { });
    showToast("Prompt copied!");
  }, [showToast]);

  const handleViewChange = (v) => {
    if ((v === "UPLOAD" || v === "WISHLIST" || v === "STUDIO") && !token && !adminToken) {
      setAuthModal(true);
      return;
    }
    setView(v); setFilter("ALL"); setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = useMemo(() => {
    const pArr = Array.isArray(prompts) ? prompts : [];
    return pArr.filter(p => {
      const matchFilter = filter === "ALL" || filter === "ALL" || (p.tags || []).some(t => t.toLowerCase() === filter.toLowerCase());
      const matchQuery = !query || (p.title || "").toLowerCase().includes(query.toLowerCase())
        || (p.prompt && p.prompt.toLowerCase().includes(query.toLowerCase()))
        || (p.tags || []).some(t => t.toLowerCase().includes(query.toLowerCase()));
      return matchFilter && matchQuery;
    });
  }, [prompts, filter, query]);

  const featured = prompts[0];

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div style={{ background: "var(--bg1)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
        <div className="hp-loader" />
        <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", color: "var(--txt3)", fontSize: "0.82rem", letterSpacing: "0.12em" }}>
          Loading gallery…
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg1)", color: "var(--txt1)", minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <div className="hp-noise-overlay" />
      <div className="hp-glow-mesh" />

      {/* Mobile Unique Elements */}
      <Navbar currentView={view} onView={handleViewChange} query={query} setQuery={setQuery} onAuthModal={setAuthModal} hidden={!!modal || authModal} />

      {/* ─── GALLERY VIEW ─── */}
      {view === "GALLERY" ? (
        <>
          <Hero totalCount={prompts.length} />
          <Marquee />

          {/* Unique Spotlight Cinema Section */}
          {!query && filter === "ALL" && (
            <SpotlightCinema prompts={prompts} onOpen={setModal} onViewAll={() => setView("TRENDING")} />
          )}

          {/* Filter tabs */}
          <div style={{ padding: "1.5rem 2.5rem 0", maxWidth: 1320, margin: "0 auto" }}>
            <div className="hp-filter-scroller">
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`hp-filter-tab ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                  style={{ flexShrink: 0 }}
                >
                  {f}
                </button>
              ))}
            </div>
            <div style={{ padding: '0.5rem 0' }}>
              <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "0.78rem", color: "var(--txt3)", fontWeight: 600 }}>
                Showing {filtered.length} curated prompts
              </span>
            </div>
          </div>

          {/* Section header */}
          <div style={{ padding: "0 2.5rem 1.5rem", maxWidth: 1320, margin: "0 auto" }}>
            <h2 className="hp-section-title">
              Discover Recent Prompts
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "8rem 0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✦</div>
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", color: "var(--txt3)", fontSize: "0.9rem" }}>
                No results found. Try a different filter.
              </p>
            </div>
          ) : (
            <GalleryGrid prompts={filtered} onOpen={setModal} onCopy={handleCopy} onAuthRequired={() => setAuthModal(true)} />
          )}
          {/* Featured strip */}
          {featured && (
            <FeaturedStrip data={featured} onOpen={setModal} onCopy={handleCopy} />
          )}
        </>
      ) : view === "WISHLIST" ? (
        <div style={{ paddingTop: 90 }}>
          <WishlistView onOpen={setModal} onCopy={handleCopy} />
        </div>
      ) : view === "TRENDING" ? (
        <div style={{ paddingTop: 90 }}>
          <TrendingView prompts={prompts} onOpen={setModal} onCopy={handleCopy} onAuthRequired={() => setAuthModal(true)} />
        </div>
      ) : view === "UPLOAD" ? (
        <div style={{ paddingTop: 90 }}>
          <UploadView onBack={() => setView("GALLERY")} />
        </div>
      ) : (
        /* ─── COLLECTIONS VIEW ─── */
        <div style={{ paddingTop: 90 }}>
          {/* Collections Hero */}
          <div style={{ padding: "5rem 2.5rem 2rem", maxWidth: 1320, margin: "0 auto" }}>
            <div style={{ animation: "fadeUp 0.5s ease both" }}>
              <span className="hp-label" style={{ marginBottom: "1rem" }}>Archive</span>
              <h1 style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontWeight: 800, fontSize: "clamp(3rem, 7vw, 4.5rem)", letterSpacing: "-0.03em",
                color: "var(--txt1)", lineHeight: 1.05, marginBottom: "1.2rem"
              }}>
                Browse Collections
              </h1>
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", color: "var(--txt2)", fontSize: "1rem", maxWidth: 500 }}>
                Explore curated sets of fashion visuals grouped by style, mood, and aesthetic.
              </p>
            </div>
          </div>



          <CollectionsView
            prompts={prompts}
            query={query}
            setQuery={setQuery}
            onSelectCollection={tag => { setFilter(tag); handleViewChange("GALLERY"); }}
          />
        </div>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--bdr)",
        background: "rgba(5,5,5,0.95)",
        padding: "3.5rem 2.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="hp-logo-icon" style={{ fontSize: "0.8rem" }}>F</div>
          <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--txt1)", letterSpacing: "-0.02em" }}>
            propy Prompts
          </span>
        </div>
        <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "0.78rem", color: "var(--txt3)", letterSpacing: "0.06em" }}>
          © 2026 FashionStore — All rights reserved. Engineered with precision.
        </p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href="#" style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "0.8rem", color: "var(--txt3)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseOver={e => e.target.style.color = "var(--txt1)"}
              onMouseOut={e => e.target.style.color = "var(--txt3)"}
            >{l}</a>
          ))}
        </div>
      </footer>

      {/* Modals */}
      {modal && <PromptModal data={modal} onClose={() => setModal(null)} onCopy={handleCopy} onAuthRequired={() => setAuthModal(true)} />}
      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}

      {/* Toast */}
      <Toast msg={toast} />
    </div>
  );
}