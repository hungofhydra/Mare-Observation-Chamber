import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Post from '@/models/Post';
import slugify from 'slugify';

type Ctx = { params: { id: string } };

// GET /api/posts/[id]
export async function GET(_: NextRequest, { params }: Ctx) {
  await connectDB();
  const post = await Post.findById(params.id).lean();
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

// PUT /api/posts/[id]
export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  if (body.title) body.slug = slugify(body.title, { lower: true, strict: true });

  const post = await Post.findByIdAndUpdate(params.id, body, { new: true });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

// DELETE /api/posts/[id]
export async function DELETE(_: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  await Post.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
