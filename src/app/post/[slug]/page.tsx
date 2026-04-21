import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Window } from '@/components/Window';
import { StarRating } from '@/components/StarRating';
import { renderContent } from '@/lib/renderContent';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  rating?: number;
  tags: string[];
  createdAt: string;
  published: boolean;
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/posts?limit=100`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.posts.find((p: Post) => p.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });


  return (
    <div style={{ padding: '16px 16px 40px', maxWidth: 760, margin: '0 auto' }}>
      {/* Breadcrumb toolbar */}
      <div style={{ marginBottom: 8, display: 'flex', gap: 4, alignItems: 'center' }}>
        <Link href="/">
          <button className="win98-btn" style={{ height: 22, minWidth: 60 }}>◀ Back</button>
        </Link>
        <div className="win98-panel" style={{ flex: 1, padding: '2px 6px', fontSize: 11 }}>
          📁 My Blog &apos;98 › {post.category} › {post.title}
        </div>
      </div>

      <Window
        title={`${post.title} — My Blog '98`}
        icon={post.category === 'Review' ? '⭐' : post.category === 'Gaming' ? '🎮' : '📝'}
        menuBar={
          <div className="win98-menubar">
            <span className="win98-menu-item">File</span>
            <span className="win98-menu-item">Edit</span>
            <span className="win98-menu-item">View</span>
            <span className="win98-menu-item">Help</span>
          </div>
        }
        statusBar={
          <div className="win98-statusbar">
            <span className="win98-statusbar-field">Done</span>
            <span className="win98-statusbar-field">{post.category}</span>
            {post.rating !== undefined && post.rating > 0 && (
              <span className="win98-statusbar-field">Rating: {post.rating}/5</span>
            )}
          </div>
        }
      >
        <div className="win98-content">
          {/* Post header */}
          <div style={{
            background: '#000080',
            color: '#fff',
            padding: '10px 12px',
            marginBottom: 10,
          }}>
            <h1 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>{post.title}</h1>
            <div style={{ fontSize: 10, opacity: 0.85, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span>📅 {date}</span>
              <span>📂 {post.category}</span>
              {post.rating !== undefined && post.rating > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  ⭐ Rating: <StarRating value={post.rating} readonly />
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
              {post.tags.map(t => (
                <span key={t} className="win98-badge">{t}</span>
              ))}
            </div>
          )}

          {/* Excerpt */}
          <div className="win98-fieldset">
            <legend>📌 Summary</legend>
            <p style={{ fontStyle: 'italic', lineHeight: 1.6 }}>{post.excerpt}</p>
          </div>

          {/* Content */}
          <div style={{ marginTop: 10, lineHeight: 1.7, fontSize: 12 }}>
            {renderContent(post.content)}
          </div>

          {/* Rating summary for reviews */}
          {post.category === 'Review' && post.rating !== undefined && post.rating > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="win98-fieldset">
                <legend>🏆 Final Verdict</legend>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <StarRating value={post.rating} readonly />
                  <span style={{ fontSize: 13, fontWeight: 'bold' }}>
                    {post.rating}/5 —{' '}
                    {post.rating >= 5 ? 'Masterpiece!' :
                     post.rating >= 4 ? 'Great!' :
                     post.rating >= 3 ? 'Pretty Good' :
                     post.rating >= 2 ? 'Mixed' : 'Disappointing'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Window>

      {/* Navigation */}
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
        <Link href="/">
          <button className="win98-btn">🏠 Back to Homepage</button>
        </Link>
      </div>
    </div>
  );
}
