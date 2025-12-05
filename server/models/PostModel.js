// models/PostModel.js
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pulseUsr",
      required: true,
    },
    text: { type: String, default: "" },
    mediaUrl: { type: String, default: "" },
    mediaType: { type: String, default: "" }, // "image" | "video"

    // 📍 optional location
    location: { type: String, default: "" },

    // 👍 who liked this post
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pulseUsr",
      },
    ],

    // 💬 comments
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "pulseUsr",
          required: true,
        },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const PostModel = mongoose.model("Post", PostSchema, "posts");
export default PostModel;   // 👈 THIS is the important line
