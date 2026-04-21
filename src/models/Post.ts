import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  rating?: number;        // 1-5 stars, for reviews
  coverImage?: string;
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title:      { type: String, required: true, trim: true },
    slug:       { type: String, required: true, unique: true },
    excerpt:    { type: String, required: true, maxlength: 300 },
    content:    { type: String, required: true },
    category:   { type: String, required: true, default: 'General' },
    rating:     { type: Number, min: 1, max: 5 },
    coverImage: { type: String },
    tags:       { type: [String], default: [] },
    published:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

PostSchema.index({ slug: 1 });
PostSchema.index({ published: 1, createdAt: -1 });

const Post: Model<IPost> =
  mongoose.models.Post ?? mongoose.model<IPost>('Post', PostSchema);

export default Post;
