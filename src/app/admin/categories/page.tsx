'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Window } from '@/components/Window';

interface Category {
  _id: string;
  name: string;
  emoji: string;
  showRating: boolean;
}

const EMPTY_FORM = { name: '', emoji: '📝', showRating: false };

export default function CategoriesPage() {
  const { status } = useSession();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<string | null>(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [mode, setMode]             = useState<'new' | 'edit' | null>(null);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [error, setError]           = useState('');
  const [statusMsg, setStatusMsg]   = useState('Ready');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchCategories();
  }, [status]);

  async function fetchCategories() {
    setLoading(true);
    setStatusMsg('Loading...');
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
    setStatusMsg(`${data.length} category(ies)`);
    setLoading(false);
  }

  function startNew() {
    setForm(EMPTY_FORM);
    setSelected(null);
    setMode('new');
    setError('');
  }

  function startEdit(cat: Category) {
    setSelected(cat._id);
    setForm({ name: cat.name, emoji: cat.emoji, showRating: cat.showRating });
    setMode('edit');
    setError('');
  }

  function cancelForm() {
    setMode(null);
    setError('');
  }

  async function save() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    setStatusMsg('Saving...');

    const url    = mode === 'new' ? '/api/categories' : `/api/categories/${selected}`;
    const method = mode === 'new' ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? 'Something went wrong');
      setStatusMsg('Error');
      return;
    }

    setMode(null);
    setSelected(null);
    await fetchCategories();
  }

  async function deleteCategory() {
    if (!selected) return;
    const cat = categories.find(c => c._id === selected);
    if (!cat) return;
    if (cat.name === 'General') { setError('Cannot delete the General category'); return; }
    if (!confirm(`Delete "${cat.name}"? All posts in this category will be moved to General.`)) return;

    setDeleting(true);
    setStatusMsg('Deleting...');
    const res = await fetch(`/api/categories/${selected}`, { method: 'DELETE' });
    setDeleting(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? 'Delete failed');
      setStatusMsg('Error');
      return;
    }

    setSelected(null);
    setMode(null);
    await fetchCategories();
  }

  const selectedCat = categories.find(c => c._id === selected);
  const isGeneral   = selectedCat?.name === 'General';

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div className="win98-window" style={{ padding: 20 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 12px 40px', maxWidth: 700, margin: '0 auto' }}>
      <Window
        title="Category Manager — My Blog '98"
        icon="📂"
        menuBar={
          <div className="win98-menubar">
            <span className="win98-menu-item" onClick={() => router.push('/admin')}>File</span>
          </div>
        }
        toolbar={
          <div className="win98-toolbar">
            <Link href="/admin">
              <button className="win98-btn" style={{ height: 22 }}>◀ Back</button>
            </Link>
            <div className="win98-toolbar-sep" />
            <button className="win98-btn" style={{ height: 22 }} onClick={startNew}>
              ➕ New Category
            </button>
            <button
              className="win98-btn"
              style={{ height: 22 }}
              disabled={!selected}
              onClick={() => selectedCat && startEdit(selectedCat)}
            >
              ✏️ Edit
            </button>
            <button
              className="win98-btn"
              style={{ height: 22, color: (!selected || isGeneral || deleting) ? '#808080' : '#cc0000' }}
              disabled={!selected || isGeneral || deleting}
              onClick={deleteCategory}
            >
              🗑️ Delete
            </button>
            <div className="win98-toolbar-sep" />
            <button className="win98-btn" style={{ height: 22 }} onClick={fetchCategories}>
              🔄 Refresh
            </button>
          </div>
        }
        statusBar={
          <div className="win98-statusbar">
            <span className="win98-statusbar-field">{statusMsg}</span>
            <span className="win98-statusbar-field">General cannot be deleted</span>
          </div>
        }
      >
        <div className="win98-content">
          {error && (
            <div style={{
              background: '#fff',
              borderBottom: '2px solid #cc0000',
              padding: '4px 10px',
              fontSize: 11,
              color: '#cc0000',
              marginBottom: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form panel */}
          {mode && (
            <div style={{
              border: '2px inset #808080',
              background: '#f0f0f0',
              padding: 10,
              marginBottom: 10,
            }}>
              <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8 }}>
                {mode === 'new' ? '➕ New Category' : `✏️ Edit: ${selectedCat?.name}`}
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <label className="win98-label" style={{ marginBottom: 0 }}>Name: *</label>
                <input
                  className="win98-input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Category name"
                  disabled={mode === 'edit' && isGeneral}
                  style={{ height: 22 }}
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '80px 60px 1fr', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <label className="win98-label" style={{ marginBottom: 0 }}>Emoji:</label>
                <input
                  className="win98-input"
                  value={form.emoji}
                  onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                  placeholder="📝"
                  style={{ height: 22, textAlign: 'center', fontSize: 16 }}
                  maxLength={4}
                />
                <span style={{ fontSize: 10, color: '#808080' }}>Shown next to category name</span>
              </div>

              <div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <input
                  type="checkbox"
                  className="win98-checkbox"
                  id="showRating"
                  checked={form.showRating}
                  onChange={e => setForm(f => ({ ...f, showRating: e.target.checked }))}
                />
                <label htmlFor="showRating" className="win98-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Show star rating for posts in this category
                </label>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button className="win98-btn primary" style={{ height: 22 }} onClick={save} disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save'}
                </button>
                <button className="win98-btn" style={{ height: 22 }} onClick={cancelForm} disabled={saving}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Category list */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div className="win98-progress" style={{ width: 200, margin: '0 auto 8px' }}>
                <div className="win98-progress-bar" style={{ width: '70%' }} />
              </div>
              <div style={{ fontSize: 11 }}>Loading categories...</div>
            </div>
          ) : (
            <table className="win98-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>Icon</th>
                  <th>Name</th>
                  <th style={{ width: 120 }}>Star Rating</th>
                  <th style={{ width: 80 }}>Default</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 20, color: '#808080' }}>
                      No categories. Click "New Category" to add one.
                    </td>
                  </tr>
                ) : (
                  categories.map(cat => (
                    <tr
                      key={cat._id}
                      className={selected === cat._id ? 'selected' : ''}
                      onClick={() => {
                        if (mode) return;
                        setSelected(cat._id === selected ? null : cat._id);
                        setError('');
                      }}
                      onDoubleClick={() => startEdit(cat)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ textAlign: 'center', fontSize: 16 }}>{cat.emoji}</td>
                      <td style={{ fontWeight: 'bold' }}>{cat.name}</td>
                      <td style={{ textAlign: 'center' }}>
                        {cat.showRating
                          ? <span style={{ color: '#008000' }}>✔ Yes</span>
                          : <span style={{ color: '#808080' }}>— No</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {cat.name === 'General'
                          ? <span style={{ background: '#000080', color: '#fff', padding: '1px 5px', fontSize: 10 }}>Default</span>
                          : ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Window>
    </div>
  );
}
