import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  emoji: string;
  showRating: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name:       { type: String, required: true, unique: true, trim: true },
    emoji:      { type: String, default: "📝" },
    showRating: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Category: Model<ICategory> =
  mongoose.models.Category ?? mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
