import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

// POST /api/auth/seed — creates admin if none exists (run once)
export async function POST() {
  await connectDB();
  const count = await User.countDocuments();
  if (count > 0) {
    return NextResponse.json({ message: 'Admin already exists' }, { status: 400 });
  }

  const email    = process.env.ADMIN_EMAIL    ?? 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD ?? 'changeme123';
  const name     = 'Admin';

  await User.create({ email, password, name });
  return NextResponse.json({ message: 'Admin created successfully' });
}
