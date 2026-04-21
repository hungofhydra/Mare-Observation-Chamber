'use client';
import { useState } from 'react';

interface WindowProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
  menuBar?: React.ReactNode;
  statusBar?: React.ReactNode;
  toolbar?: React.ReactNode;
}

export function Window({
  title, icon = '📄', children, className = '', style,
  onClose, menuBar, statusBar, toolbar,
}: WindowProps) {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className={`win98-window ${className}`} style={style}>
      {/* Title bar */}
      <div className="win98-titlebar">
        <span className="win98-titlebar-icon">{icon}</span>
        <span className="win98-titlebar-title">{title}</span>
        <div className="win98-titlebar-buttons">
          <button className="win98-tb-btn" onClick={() => setMinimized(m => !m)} title="Minimize">_</button>
          <button className="win98-tb-btn" title="Maximize">□</button>
          <button
            className="win98-tb-btn"
            style={{ fontWeight: 'bold', marginLeft: 2 }}
            onClick={onClose}
            title="Close"
          >✕</button>
        </div>
      </div>

      {!minimized && (
        <>
          {menuBar}
          {toolbar}
          {children}
          {statusBar}
        </>
      )}
    </div>
  );
}
