import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    newsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "news",
      required: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "users",
      default: [],
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for query optimization
CommentSchema.index({ newsId: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1 });

const CommentModel = mongoose.model("comments", CommentSchema);

export default CommentModel;
