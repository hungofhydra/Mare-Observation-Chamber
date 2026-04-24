import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Post from "@/models/Post";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, emoji, showRating } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  await connectDB();
  const category = await Category.findById(params.id);
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isGeneral = category.name === "General";

  if (!isGeneral && name.trim() !== category.name) {
    const conflict = await Category.findOne({ name: name.trim() });
    if (conflict) return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    await Post.updateMany({ category: category.name }, { category: name.trim() });
  }

  category.name       = isGeneral ? "General" : name.trim();
  category.emoji      = emoji?.trim() || "📝";
  category.showRating = Boolean(showRating);
  await category.save();

  return NextResponse.json(category);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const category = await Category.findById(params.id);
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (category.name === "General") {
    return NextResponse.json({ error: "Cannot delete the General category" }, { status: 400 });
  }

  await Post.updateMany({ category: category.name }, { category: "General" });
  await category.deleteOne();

  return NextResponse.json({ success: true });
}
