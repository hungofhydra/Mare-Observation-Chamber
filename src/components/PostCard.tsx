import Link from 'next/link';
import { StarRating } from './StarRating';

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    rating?: number;
    coverImage?: string;
    tags: string[];
    createdAt: string;
    published: boolean;
  };
  showDraft?: boolean;
}

export function PostCard({ post, showDraft = false }: PostCardProps) {
  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <Link href={`/post/${post.slug}`} className="post-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div className="post-card-titlebar">
        <span>{post.category === 'Review' ? '⭐' : post.category === 'Tech' ? '💾' : post.category === 'Gaming' ? '🎮' : '📝'}</span>
        <span>{post.category}</span>
        {showDraft && !post.published && (
          <span style={{ marginLeft: 'auto', background: '#ffff00', color: '#000', padding: '0 4px', fontSize: 9 }}>DRAFT</span>
        )}
      </div>
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
      )}
      <div className="post-card-body">
        <div className="post-card-title">{post.title}</div>
        <div className="post-card-meta">
          <span>📅 {date}</span>
          {post.rating !== undefined && post.rating > 0 && (
            <span><StarRating value={post.rating} readonly /></span>
          )}
          {post.tags.slice(0, 3).map(t => (
            <span key={t} style={{ background: '#000080', color: '#fff', padding: '0 4px', fontSize: 9 }}>
              {t}
            </span>
          ))}
        </div>
        <div className="post-card-excerpt">{post.excerpt}</div>
      </div>
    </Link>
  );
}
