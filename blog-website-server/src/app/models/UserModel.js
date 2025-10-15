import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin", "supervisor admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "blocked", "offline"],
      default: "active",
    },
    previousStatus: {
      type: String,
      enum: ["active", "offline"],
      default: "active",
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;
