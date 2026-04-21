'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Window } from '@/components/Window';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password.');
    } else {
      router.push('/admin');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 20px 60px',
    }}>
      <Window title="Log On to My Blog '98" icon="🔐" style={{ width: '100%', maxWidth: 340 }}>
        <div className="win98-content">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 40 }}>👤</div>
            <div style={{ fontSize: 11, color: '#808080' }}>
              Enter your credentials to continue
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="win98-label">User name:</label>
              <input
                className="win98-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-row">
              <label className="win98-label">Password:</label>
              <input
                className="win98-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                background: '#fff',
                border: '1px solid #ff0000',
                padding: '4px 8px',
                marginBottom: 8,
                fontSize: 11,
                color: '#cc0000',
                display: 'flex',
                gap: 6,
                alignItems: 'center',
              }}>
                ⚠️ {error}
              </div>
            )}

            {loading && (
              <div style={{ marginBottom: 8 }}>
                <div className="win98-progress">
                  <div className="win98-progress-bar" style={{ width: '60%' }} />
                </div>
                <div style={{ fontSize: 10, textAlign: 'center', marginTop: 2 }}>
                  Verifying credentials...
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <button type="submit" className="win98-btn primary" disabled={loading}>
                OK
              </button>
              <button
                type="button"
                className="win98-btn"
                onClick={() => router.push('/')}
              >
                Cancel
              </button>
            </div>
          </form>

          <div style={{
            marginTop: 12,
            borderTop: '1px solid #808080',
            paddingTop: 8,
            fontSize: 10,
            color: '#808080',
            textAlign: 'center',
          }}>
            First time? Run <code>POST /api/auth/seed</code> to create your admin account.
          </div>
        </div>
      </Window>
    </div>
  );
}
