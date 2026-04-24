'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Window } from '@/components/Window';
import { StarRating } from '@/components/StarRating';

interface Post {
  _id: string;
  title: string;
  slug: string;
  category: string;
  rating?: number;
  published: boolean;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
  emoji: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts]         = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<string | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [statusMsg, setStatusMsg] = useState('Ready');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPosts();
      fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {});
    }
  }, [status]);

  async function fetchPosts() {
    setLoading(true);
    setStatusMsg('Loading posts...');
    const res = await fetch('/api/posts?limit=100');
    const data = await res.json();
    setPosts(data.posts ?? []);
    setStatusMsg(`${data.posts?.length ?? 0} item(s)`);
    setLoading(false);
  }

  const emojiMap = Object.fromEntries(categories.map(c => [c.name, c.emoji]));

  async function togglePublish(post: Post) {
    setStatusMsg('Updating...');
    await fetch(`/api/posts/${post._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !post.published }),
    });
    await fetchPosts();
  }

  async function deletePost() {
    if (!selected) return;
    if (!confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(true);
    setStatusMsg('Deleting...');
    await fetch(`/api/posts/${selected}`, { method: 'DELETE' });
    setSelected(null);
    await fetchPosts();
    setDeleting(false);
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div className="win98-window" style={{ padding: 20 }}>Loading...</div>
      </div>
    );
  }

  const selectedPost = posts.find(p => p._id === selected);

  return (
    <div style={{ padding: '12px 12px 40px', maxWidth: 900, margin: '0 auto' }}>
      <Window
        title="Admin Panel — My Blog '98"
        icon="⚙️"
        menuBar={
          <div className="win98-menubar">
            <span className="win98-menu-item">File</span>
            <span className="win98-menu-item">Edit</span>
            <span className="win98-menu-item">View</span>
            <span className="win98-menu-item" onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</span>
          </div>
        }
        toolbar={
          <div className="win98-toolbar">
            <Link href="/admin/new">
              <button className="win98-btn" style={{ height: 22 }}>✏️ New Post</button>
            </Link>
            <div className="win98-toolbar-sep" />
            <button
              className="win98-btn"
              style={{ height: 22 }}
              disabled={!selected}
              onClick={() => selected && router.push(`/admin/edit/${selected}`)}
            >
              📝 Edit
            </button>
            <button
              className="win98-btn"
              style={{ height: 22 }}
              disabled={!selected}
              onClick={() => selectedPost && togglePublish(selectedPost)}
            >
              {selectedPost?.published ? '📥 Unpublish' : '📤 Publish'}
            </button>
            <button
              className="win98-btn"
              style={{ height: 22, color: deleting ? '#808080' : '#cc0000' }}
              disabled={!selected || deleting}
              onClick={deletePost}
            >
              🗑️ Delete
            </button>
            <div className="win98-toolbar-sep" />
            <button className="win98-btn" style={{ height: 22 }} onClick={fetchPosts}>
              🔄 Refresh
            </button>
            <div className="win98-toolbar-sep" />
            <Link href="/admin/categories">
              <button className="win98-btn" style={{ height: 22 }}>📂 Categories</button>
            </Link>
            <div className="win98-toolbar-sep" />
            <Link href="/">
              <button className="win98-btn" style={{ height: 22 }}>🌐 View Blog</button>
            </Link>
          </div>
        }
        statusBar={
          <div className="win98-statusbar">
            <span className="win98-statusbar-field">{statusMsg}</span>
            <span className="win98-statusbar-field">
              Logged in as: {session?.user?.name ?? session?.user?.email}
            </span>
          </div>
        }
      >
        <div className="win98-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div className="win98-progress" style={{ width: 200, margin: '0 auto 8px' }}>
                <div className="win98-progress-bar" style={{ width: '70%' }} />
              </div>
              <div style={{ fontSize: 11 }}>Loading posts...</div>
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>
              <table className="win98-table" style={{ minWidth: 600 }}>
                <thead>
                  <tr>
                    <th style={{ width: 24 }}></th>
                    <th>Title</th>
                    <th style={{ width: 90 }}>Category</th>
                    <th style={{ width: 80 }}>Rating</th>
                    <th style={{ width: 70 }}>Status</th>
                    <th style={{ width: 100 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#808080' }}>
                        No posts yet. Click "New Post" to get started!
                      </td>
                    </tr>
                  ) : (
                    posts.map(post => (
                      <tr
                        key={post._id}
                        className={selected === post._id ? 'selected' : ''}
                        onClick={() => setSelected(post._id === selected ? null : post._id)}
                        onDoubleClick={() => router.push(`/admin/edit/${post._id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ textAlign: 'center' }}>
                          {emojiMap[post.category] ?? '📝'}
                        </td>
                        <td style={{ fontWeight: 'bold' }}>{post.title}</td>
                        <td>{post.category}</td>
                        <td>
                          {post.rating !== undefined && post.rating > 0
                            ? <StarRating value={post.rating} readonly />
                            : <span style={{ color: '#808080' }}>—</span>}
                        </td>
                        <td>
                          <span style={{
                            background: post.published ? '#008000' : '#808080',
                            color: '#fff',
                            padding: '1px 5px',
                            fontSize: 10,
                          }}>
                            {post.published ? 'Live' : 'Draft'}
                          </span>
                        </td>
                        <td style={{ color: '#404040' }}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Window>

      {/* Stats panel */}
      <Window title="Statistics" icon="📊" style={{ marginTop: 10 }}>
        <div className="win98-content" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Posts', value: posts.length, icon: '📰' },
            { label: 'Published',   value: posts.filter(p => p.published).length,  icon: '📤' },
            { label: 'Drafts',      value: posts.filter(p => !p.published).length, icon: '📥' },
            { label: 'Reviews',     value: posts.filter(p => p.category === 'Review').length, icon: '⭐' },
          ].map(stat => (
            <div key={stat.label} className="win98-panel" style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: '10px 8px' }}>
              <div style={{ fontSize: 24 }}>{stat.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: '#404040' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </Window>
    </div>
  );
}
