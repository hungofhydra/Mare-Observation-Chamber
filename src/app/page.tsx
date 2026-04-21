import { Window } from '@/components/Window';
import { PostCard } from '@/components/PostCard';
import Image from 'next/image'

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  rating?: number;
  tags: string[];
  createdAt: string;
  published: boolean;
}

async function getPosts(category?: string): Promise<{ posts: Post[]; total: number }> {
  try {
    const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const params = new URLSearchParams({ limit: '100' });
    if (category && category !== 'All') params.set('category', category);
    const res = await fetch(`${base}/api/posts?${params}`, { cache: 'no-store' });
    if (!res.ok) return { posts: [], total: 0 };
    return res.json();
  } catch {
    return { posts: [], total: 0 };
  }
}

const CATEGORIES = ['All', 'General', 'Review', 'Tech', 'Gaming', 'Movies', 'Music', 'Books'];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const selectedCat = searchParams.category ?? 'All';
  const searchQuery = searchParams.search ?? '';
  const { posts, total } = await getPosts(selectedCat);
  const filtered = searchQuery
    ? posts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : posts;

  return (
    <div style={{ padding: '16px 16px 40px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header Window */}
      <Window
        title="Mare Observation Chamber"
        icon="🌐"
        style={{ marginBottom: 12 }}
        menuBar={
          <div className="win98-menubar">
            <span className="win98-menu-item">File</span>
            <span className="win98-menu-item">Edit</span>
            <span className="win98-menu-item">View</span>
            <span className="win98-menu-item">Favorites</span>
            <span className="win98-menu-item">Help</span>
          </div>
        }
        toolbar={
          <div className="win98-toolbar">
            <div className="win98-toolbar-sep" />
            <form
              method="get"
              action="/"
              style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}
            >
              {selectedCat !== 'All' && (
                <input type="hidden" name="category" value={selectedCat} />
              )}
              <label style={{ fontSize: 11, whiteSpace: 'nowrap' }}>Search:</label>
              <input
                className="win98-input"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search posts by title..."
                style={{ height: 22, flex: 1 }}
              />
              <button className="win98-btn" type="submit" style={{ minWidth: 40, height: 22 }}>Go</button>
            </form>
          </div>
        }
        statusBar={
          <div className="win98-statusbar">
            <span className="win98-statusbar-field">Done</span>
            <span className="win98-statusbar-field">{total} post{total !== 1 ? 's' : ''} total</span>
          </div>
        }
      >
        <div className="win98-content">
          {/* Hero */}
          <div style={{
            background: 'linear-gradient(to right, #000080, #1084d0)',
            color: '#fff',
            padding: '16px',
            marginBottom: 10,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', fontFamily: "'VT323', monospace" }}>
              🌠 Mare Observation Chamber 🌠
            </div>
            <div style={{ fontSize: 11, marginTop: 4 }}>
              Welcome to my personal corner of the Internet! Reviews, thoughts & more.
            </div>
            <div style={{
              marginTop: 8,
              fontSize: 10,
              borderTop: '1px solid rgba(255,255,255,0.3)',
              paddingTop: 6,
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
            }}>
              <Image width={500} height={250} src={"https://static.wikia.nocookie.net/saimoe/images/8/82/Mare_vn_profile_2.png/revision/latest?cb=20211020115912"} alt=''></Image>
            </div>
          </div>

          {/* Category filter */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, marginBottom: 4, fontWeight: 'bold' }}>📂 Categories:</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <a key={cat} href={cat === 'All' ? '/' : `/?category=${cat}`} style={{ textDecoration: 'none' }}>
                  <span className={`win98-badge ${selectedCat === cat ? 'active' : ''}`}>
                    {cat}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </Window>

      {/* Posts grid */}
      <Window
        title={`Posts${selectedCat !== 'All' ? ` — ${selectedCat}` : ''}${searchQuery ? ` — "${searchQuery}"` : ''} (${filtered.length})`}
        icon="📰"
        statusBar={
          <div className="win98-statusbar">
            <span className="win98-statusbar-field">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        }
      >
        <div className="win98-content">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#808080' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
              <div>No posts yet. Check back soon!</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 10,
            }}>
              {filtered.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </Window>

      {/* Footer */}
      <div style={{
        marginTop: 10,
        textAlign: 'center',
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        textShadow: '1px 1px #000',
      }}>
        ⭐ Mare Observation Chamber — Best viewed with Internet Explorer 5.0 ⭐
        <br />
        <span style={{ fontSize: 9 }}>© 1998-2024 All rights reserved. You are visitor #000042</span>
      </div>
    </div>
  );
}
