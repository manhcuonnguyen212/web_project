import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    postCount: {
      type: Number,
      default: 0,
    },
    
  },
  { timestamps: true }
);


const CategoryModel = mongoose.model("categories", CategorySchema);

export default CategoryModel;
