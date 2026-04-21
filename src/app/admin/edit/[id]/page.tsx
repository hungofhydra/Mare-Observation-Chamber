'use client';
import { useEffect, useState } from 'react';
import { PostEditor } from '@/components/PostEditor';

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/posts/${params.id}`)
      .then(r => r.json())
      .then(data => { setPost(data); setLoading(false); });
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div className="win98-window" style={{ padding: 20 }}>
          <div className="win98-progress" style={{ width: 200, marginBottom: 8 }}>
            <div className="win98-progress-bar" style={{ width: '60%' }} />
          </div>
          Loading post...
        </div>
      </div>
    );
  }

  if (!post || post.error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div className="win98-window" style={{ padding: 20 }}>⚠️ Post not found.</div>
      </div>
    );
  }

  return <PostEditor mode="edit" postId={params.id} initial={post} />;
}
