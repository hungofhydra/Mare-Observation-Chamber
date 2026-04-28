'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export function Taskbar() {
  const [time, setTime] = useState('');
  const { data: session } = useSession();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="win98-taskbar">
      <Link href="/">
        <button className="win98-start-btn">
          <span style={{ fontSize: 14 }}>🖥️</span>
          <strong>Start</strong>
        </button>
      </Link>

      <div style={{ width: 1, height: 20, background: '#808080', boxShadow: '1px 0 #fff', margin: '0 4px' }} />

      <Link href="/">
        <button className="win98-btn" style={{ minWidth: 120, height: 22, textAlign: 'left', fontSize: 11 }}>
          📰 Mare Observation Chamber
        </button>
      </Link>

      {session && (
        <Link href="/admin">
          <button className="win98-btn" style={{ minWidth: 120, height: 22, textAlign: 'left', fontSize: 11 }}>
            ⚙️ Admin Panel
          </button>
        </Link>
      )}

      <div className="win98-clock">{time}</div>
    </div>
  );
}
