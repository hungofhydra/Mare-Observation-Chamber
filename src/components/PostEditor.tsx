'use client';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Window } from './Window';
import { StarRating } from './StarRating';
import { renderContent } from '@/lib/renderContent';

interface CategoryOption {
  _id: string;
  name: string;
  emoji: string;
  showRating: boolean;
}

interface PostData {
  _id?: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  rating: number;
  tags: string;
  published: boolean;
  coverImage: string;
}

interface PostEditorProps {
  initial?: Partial<PostData>;
  mode: 'new' | 'edit';
  postId?: string;
}

export function PostEditor({ initial, mode, postId }: PostEditorProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const [form, setForm] = useState<PostData>({
    title:      initial?.title      ?? '',
    excerpt:    initial?.excerpt    ?? '',
    content:    initial?.content    ?? '',
    category:   initial?.category   ?? 'General',
    rating:     initial?.rating     ?? 0,
    tags:       Array.isArray((initial as any)?.tags) ? (initial as any).tags.join(', ') : (initial?.tags ?? ''),
    published:  initial?.published  ?? false,
    coverImage: (initial as any)?.coverImage ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [statusMsg, setStatusMsg] = useState('Ready');
  const [preview, setPreview] = useState(false);
  const [imgTab, setImgTab] = useState<'url' | 'file'>('url');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // inline image inserter state
  const [showImgInsert, setShowImgInsert] = useState(false);
  const [imgInsertTab, setImgInsertTab] = useState<'url' | 'file'>('url');
  const [imgInsertUrl, setImgInsertUrl] = useState('');
  const [imgInsertUploading, setImgInsertUploading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInsertRef = useRef<HTMLInputElement>(null);

  function set(field: keyof PostData, value: string | number | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    setUploading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? 'Upload failed');
      return;
    }
    const { url } = await res.json();
    set('coverImage', url);
  }

  function insertImageAtCursor(url: string) {
    const ta = contentRef.current;
    if (!ta) return;
    const syntax = `![](${url})`;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = form.content.slice(0, start);
    const after = form.content.slice(end);
    const needsNewlineBefore = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
    const needsNewlineAfter = after.length > 0 && !after.startsWith('\n') ? '\n' : '';
    const newContent = before + needsNewlineBefore + syntax + needsNewlineAfter + after;
    set('content', newContent);
    setShowImgInsert(false);
    setImgInsertUrl('');
    setTimeout(() => {
      ta.focus();
      const pos = before.length + needsNewlineBefore.length + syntax.length;
      ta.setSelectionRange(pos, pos);
    }, 0);
  }

  function wrapSelection(before: string, after: string) {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = form.content.slice(start, end);
    const newContent = form.content.slice(0, start) + before + selected + after + form.content.slice(end);
    set('content', newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }

  function setLineAlign(align: 'left' | 'center' | 'right') {
    const ta = contentRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const content = form.content;
    const lineStart = content.lastIndexOf('\n', pos - 1) + 1;
    const lineEnd = content.indexOf('\n', pos);
    const end = lineEnd === -1 ? content.length : lineEnd;
    let line = content.slice(lineStart, end);
    line = line.replace(/^\[center\] /, '').replace(/^\[right\] /, '');
    const prefix = align === 'center' ? '[center] ' : align === 'right' ? '[right] ' : '';
    const newLine = prefix + line;
    set('content', content.slice(0, lineStart) + newLine + content.slice(end));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(lineStart + newLine.length, lineStart + newLine.length);
    }, 0);
  }

  async function handleInsertFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgInsertUploading(true);
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    setImgInsertUploading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? 'Upload failed');
      return;
    }
    const { url } = await res.json();
    insertImageAtCursor(url);
  }

  async function save(publish?: boolean) {
    setSaving(true);
    setError('');
    setStatusMsg('Saving...');

    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      published: publish !== undefined ? publish : form.published,
      rating: Number(form.rating),
    };

    const url    = mode === 'new' ? '/api/posts' : `/api/posts/${postId}`;
    const method = mode === 'new' ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? 'Something went wrong. Please try again.');
      setStatusMsg('Error');
      return;
    }

    setStatusMsg('Saved!');
    router.push('/admin');
  }

  const selectedCatData = categories.find(c => c.name === form.category);
  const showRating = selectedCatData?.showRating ?? false;

  return (
    <div style={{ padding: '12px 12px 40px', maxWidth: 860, margin: '0 auto' }}>
      <Window
        title={mode === 'new' ? 'New Post — My Blog \'98' : `Editing: ${form.title || 'Untitled'}`}
        icon="✏️"
        menuBar={
          <div className="win98-menubar">
            <span className="win98-menu-item" onClick={() => router.push('/admin')}>File</span>
            <span className="win98-menu-item" onClick={() => setPreview(p => !p)}>
              View ({preview ? 'Editor' : 'Preview'})
            </span>
          </div>
        }
        toolbar={
          <div className="win98-toolbar">
            <button className="win98-btn" style={{ height: 22 }} onClick={() => router.push('/admin')}>
              ◀ Back
            </button>
            <div className="win98-toolbar-sep" />
            <button
              className="win98-btn"
              style={{ height: 22 }}
              onClick={() => save(false)}
              disabled={saving}
            >
              💾 Save Draft
            </button>
            <button
              className="win98-btn primary"
              style={{ height: 22 }}
              onClick={() => save(true)}
              disabled={saving}
            >
              📤 Publish
            </button>
            <div className="win98-toolbar-sep" />
            <button
              className="win98-btn"
              style={{ height: 22 }}
              onClick={() => { setShowImgInsert(s => !s); setPreview(false); }}
            >
              🖼️ Insert Image
            </button>
            <div className="win98-toolbar-sep" />
            <button
              className="win98-btn"
              style={{ height: 22 }}
              onClick={() => setPreview(p => !p)}
            >
              {preview ? '✏️ Edit' : '👁️ Preview'}
            </button>
          </div>
        }
        statusBar={
          <div className="win98-statusbar">
            <span className="win98-statusbar-field">{statusMsg}</span>
            <span className="win98-statusbar-field">{form.content.length} chars</span>
            <span className="win98-statusbar-field">{form.content.split(/\s+/).filter(Boolean).length} words</span>
          </div>
        }
      >
        {error && (
          <div style={{
            background: '#fff',
            borderBottom: '2px solid #cc0000',
            padding: '4px 10px',
            fontSize: 11,
            color: '#cc0000',
            display: 'flex',
            gap: 6,
            alignItems: 'center',
          }}>
            ⚠️ {error}
          </div>
        )}

        {showImgInsert && (
          <div style={{
            borderBottom: '2px solid #000080',
            background: '#f0f0f0',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap',
            fontSize: 11,
          }}>
            <strong style={{ fontSize: 11 }}>🖼️ Insert image:</strong>
            {(['url', 'file'] as const).map(tab => (
              <button
                key={tab}
                className="win98-btn"
                style={{ height: 20, fontSize: 10, fontWeight: imgInsertTab === tab ? 'bold' : undefined }}
                onClick={() => setImgInsertTab(tab)}
              >
                {tab === 'url' ? '🔗 URL' : '📁 File'}
              </button>
            ))}
            <div className="win98-toolbar-sep" />
            {imgInsertTab === 'url' ? (
              <>
                <input
                  className="win98-input"
                  style={{ width: 260, height: 20 }}
                  value={imgInsertUrl}
                  onChange={e => setImgInsertUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  onKeyDown={e => { if (e.key === 'Enter' && imgInsertUrl) insertImageAtCursor(imgInsertUrl); }}
                  autoFocus
                />
                <button
                  className="win98-btn primary"
                  style={{ height: 20, fontSize: 10 }}
                  disabled={!imgInsertUrl}
                  onClick={() => insertImageAtCursor(imgInsertUrl)}
                >
                  Insert
                </button>
              </>
            ) : (
              <>
                <button
                  className="win98-btn"
                  style={{ height: 20, fontSize: 10 }}
                  disabled={imgInsertUploading}
                  onClick={() => fileInsertRef.current?.click()}
                >
                  {imgInsertUploading ? '⏳ Uploading...' : '📂 Browse...'}
                </button>
                <input
                  ref={fileInsertRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleInsertFileUpload}
                />
              </>
            )}
            <button
              className="win98-btn"
              style={{ height: 20, fontSize: 10, marginLeft: 'auto' }}
              onClick={() => { setShowImgInsert(false); setImgInsertUrl(''); }}
            >
              ✕
            </button>
          </div>
        )}

        <div className="win98-content">
          {preview ? (
            /* ── PREVIEW ── */
            <div>
              <div style={{ background: '#000080', color: '#fff', padding: '8px 12px', marginBottom: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 'bold' }}>{form.title || '(no title)'}</div>
                <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
                  {form.category}
                  {showRating && form.rating > 0 && <> · <StarRating value={form.rating} readonly /></>}
                </div>
              </div>
              {form.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.coverImage}
                  alt="Cover"
                  style={{ width: '100%', maxHeight: 200, objectFit: 'cover', marginBottom: 10, border: '1px solid #808080' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div style={{ fontStyle: 'italic', marginBottom: 10, padding: '6px 8px', background: '#f0f0f0', boxShadow: 'inset 1px 1px #808080' }}>
                {form.excerpt || '(no excerpt)'}
              </div>
              <div style={{ lineHeight: 1.7, fontSize: 12 }}>
                {renderContent(form.content)}
              </div>
            </div>
          ) : (
            /* ── EDITOR ── */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Left column */}
              <div>
                <div className="form-row">
                  <label className="win98-label">Title: *</label>
                  <input
                    className="win98-input"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="Post title..."
                    required
                  />
                </div>

                <div className="form-row">
                  <label className="win98-label">Category:</label>
                  <select
                    className="win98-select"
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                    style={{ width: '100%', height: 22 }}
                  >
                    {categories.map(c => (
                      <option key={c._id} value={c.name}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                </div>

                {showRating && (
                  <div className="form-row">
                    <label className="win98-label">Rating (1–5 stars):</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarRating value={form.rating} onChange={v => set('rating', v)} />
                      {form.rating > 0 && (
                        <button
                          className="win98-btn"
                          style={{ height: 18, minWidth: 40, fontSize: 10 }}
                          onClick={() => set('rating', 0)}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <label className="win98-label">Tags (comma-separated):</label>
                  <input
                    className="win98-input"
                    value={form.tags}
                    onChange={e => set('tags', e.target.value)}
                    placeholder="games, indie, rpg"
                  />
                </div>

                <div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="checkbox"
                    className="win98-checkbox"
                    id="published"
                    checked={form.published}
                    onChange={e => set('published', e.target.checked)}
                  />
                  <label htmlFor="published" className="win98-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    Published (visible to readers)
                  </label>
                </div>
              </div>

              {/* Right column */}
              <div>
                <div className="form-row">
                  <label className="win98-label">Excerpt / Summary: *</label>
                  <textarea
                    className="win98-input"
                    value={form.excerpt}
                    onChange={e => set('excerpt', e.target.value)}
                    placeholder="Brief summary shown on the homepage..."
                    style={{ minHeight: 72 }}
                    maxLength={300}
                  />
                  <div style={{ fontSize: 10, color: '#808080', textAlign: 'right' }}>
                    {form.excerpt.length}/300
                  </div>
                </div>
              </div>

              {/* Cover image — full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="form-row">
                  <label className="win98-label">Cover Image:</label>
                  <div style={{ border: '2px inset #808080', background: '#fff', padding: 6 }}>
                    {/* Tab bar */}
                    <div style={{ display: 'flex', gap: 0, marginBottom: 6 }}>
                      {(['url', 'file'] as const).map(tab => (
                        <button
                          key={tab}
                          className="win98-btn"
                          style={{
                            height: 20,
                            fontSize: 10,
                            borderBottom: imgTab === tab ? '2px solid #000080' : undefined,
                            fontWeight: imgTab === tab ? 'bold' : undefined,
                          }}
                          onClick={() => setImgTab(tab)}
                        >
                          {tab === 'url' ? '🔗 URL' : '📁 Local File'}
                        </button>
                      ))}
                    </div>

                    {imgTab === 'url' ? (
                      <input
                        className="win98-input"
                        value={form.coverImage}
                        onChange={e => set('coverImage', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        style={{ width: '100%' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          className="win98-btn"
                          style={{ height: 22 }}
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          {uploading ? '⏳ Uploading...' : '📂 Browse...'}
                        </button>
                        <span style={{ fontSize: 10, color: '#808080' }}>
                          {form.coverImage ? form.coverImage.split('/').pop() : 'No file selected'} (JPEG/PNG/GIF/WebP, max 5 MB)
                        </span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                        />
                      </div>
                    )}

                    {/* Preview */}
                    {form.coverImage && (
                      <div style={{ marginTop: 6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.coverImage}
                          alt="Cover preview"
                          style={{ maxHeight: 80, maxWidth: 140, objectFit: 'cover', border: '1px solid #808080' }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <button
                          className="win98-btn"
                          style={{ height: 18, fontSize: 10 }}
                          onClick={() => set('coverImage', '')}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content — full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="form-row">
                  <label className="win98-label">
                    Content: * &nbsp;
                    <span style={{ fontWeight: 'normal', color: '#808080' }}>
                      (# heading, ## subheading, - bullet, **bold**, *italic*, [center]/[right] align)
                    </span>
                  </label>
                  {/* Formatting toolbar */}
                  <div style={{
                    display: 'flex', gap: 2, padding: '3px 4px',
                    border: '2px inset #808080', borderBottom: 'none',
                    background: '#d4d0c8',
                  }}>
                    <button className="win98-btn" style={{ height: 20, minWidth: 24, fontWeight: 'bold', fontSize: 12 }}
                      title="Bold — wraps selection in **text**"
                      onMouseDown={e => { e.preventDefault(); wrapSelection('**', '**'); }}>B</button>
                    <button className="win98-btn" style={{ height: 20, minWidth: 24, fontStyle: 'italic', fontSize: 12 }}
                      title="Italic — wraps selection in *text*"
                      onMouseDown={e => { e.preventDefault(); wrapSelection('*', '*'); }}>I</button>
                    <div className="win98-toolbar-sep" style={{ margin: '2px 3px' }} />
                    <button className="win98-btn" style={{ height: 20, minWidth: 26, fontSize: 11 }}
                      title="Align left"
                      onMouseDown={e => { e.preventDefault(); setLineAlign('left'); }}>≡←</button>
                    <button className="win98-btn" style={{ height: 20, minWidth: 26, fontSize: 11 }}
                      title="Align center"
                      onMouseDown={e => { e.preventDefault(); setLineAlign('center'); }}>≡=</button>
                    <button className="win98-btn" style={{ height: 20, minWidth: 26, fontSize: 11 }}
                      title="Align right"
                      onMouseDown={e => { e.preventDefault(); setLineAlign('right'); }}>≡→</button>
                  </div>
                  <textarea
                    ref={contentRef}
                    className="win98-input"
                    value={form.content}
                    onChange={e => set('content', e.target.value)}
                    placeholder="Write your post here..."
                    style={{ minHeight: 260, fontFamily: 'monospace', fontSize: 12, borderTop: 'none' }}
                  />
                </div>
              </div>
            </div>
          )}

          {saving && (
            <div style={{ marginTop: 8 }}>
              <div className="win98-progress">
                <div className="win98-progress-bar" style={{ width: '80%' }} />
              </div>
              <div style={{ fontSize: 10, textAlign: 'center', marginTop: 2 }}>Saving post...</div>
            </div>
          )}
        </div>
      </Window>
    </div>
  );
}
