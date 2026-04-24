import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

const DEFAULT_CATEGORIES = [
  { name: "General",  emoji: "📝", showRating: false },
  { name: "Review",   emoji: "⭐", showRating: true  },
  { name: "Tech",     emoji: "💾", showRating: false },
  { name: "Gaming",   emoji: "🎮", showRating: true  },
  { name: "Movies",   emoji: "🎬", showRating: true  },
  { name: "Music",    emoji: "🎵", showRating: true  },
  { name: "Books",    emoji: "📚", showRating: true  },
];

export async function GET() {
  await connectDB();
  let categories = await Category.find().sort({ createdAt: 1 }).lean();
  if (categories.length === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
    categories = await Category.find().sort({ createdAt: 1 }).lean();
  }
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, emoji, showRating } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  await connectDB();
  const existing = await Category.findOne({ name: name.trim() });
  if (existing) return NextResponse.json({ error: "Category already exists" }, { status: 409 });

  const category = await Category.create({
    name: name.trim(),
    emoji: emoji?.trim() || "📝",
    showRating: Boolean(showRating),
  });
  return NextResponse.json(category, { status: 201 });
}
