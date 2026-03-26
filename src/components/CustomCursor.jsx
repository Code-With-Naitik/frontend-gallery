import React, { useState, useEffect } from "react";

const CURSOR_CSS = `
  .hp-custom-cursor {
    position: fixed; top: 0; left: 0;
    width: 10px; height: 10px;
    background: #FFF; border-radius: 50%;
    pointer-events: none; z-index: 10000;
    mix-blend-mode: difference;
    transform: translate(-50%, -50%);
    transition: width 0.3s cubic-bezier(0.23, 1, 0.32, 1), 
                height 0.3s cubic-bezier(0.23, 1, 0.32, 1),
                background 0.3s ease;
    will-change: transform, width, height;
  }
  .hp-custom-cursor.hovering {
    width: 60px; height: 60px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  body, a, button, input, select, textarea, [role="button"] {
    cursor: none !important;
  }
`;

export default function CustomCursor() {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Inject CSS
    const style = document.createElement("style");
    style.innerHTML = CURSOR_CSS;
    document.head.appendChild(style);

    const onMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    const onOver = (e) => {
      const target = e.target;
      const isInteractive = !!target.closest('button, a, .hp-card, .hp-nav-link, input, select, textarea, [role="button"]');
      setIsHovering(isInteractive);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      className={`hp-custom-cursor ${isHovering ? "hovering" : ""}`}
      style={{
        left: cursorPos.x,
        top: cursorPos.y,
      }}
    />
  );
}
