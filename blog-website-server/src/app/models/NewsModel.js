import mongoose from "mongoose";

// Content Block Schema - for paragraph and image blocks
const ContentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["paragraph", "image"],
      required: true,
    },
    // For paragraph type
    text: {
      type: String,
      default: "",
    },
    // For image type
    url: {
      type: String,
      default: "",
    },
    alt: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const NewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: [ContentBlockSchema],
      required: true,
    },
    excerpt: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["published", "hidden"],
      default: "published",
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    publishedAt: {
      type: Date,
      default: null,
    },
    comments: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
    },
  },
  {
    timestamps: true,
  }
);

// // Index for search optimization
// NewsSchema.index({ title: "text", content: "text" });
// NewsSchema.index({ category: 1, status: 1 });
// NewsSchema.index({ author: 1 });
// NewsSchema.index({ createdAt: -1 });

const NewsModel = mongoose.model("news", NewsSchema);

export default NewsModel;
