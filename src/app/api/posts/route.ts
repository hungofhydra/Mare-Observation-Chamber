import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Post from '@/models/Post';
import slugify from 'slugify';

// GET /api/posts  — public: published only; admin: all
export async function GET(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const page  = parseInt(searchParams.get('page')  ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '10', 10);
  const cat   = searchParams.get('category') ?? '';

  const filter: Record<string, unknown> = session ? {} : { published: true };
  if (cat) filter.category = cat;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) });
}

// POST /api/posts  — admin only
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();

  const slug = slugify(body.title, { lower: true, strict: true });

  const post = await Post.create({ ...body, slug });
  return NextResponse.json(post, { status: 201 });
}
