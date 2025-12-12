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
    mediaType: { type: String, default: "" }, 

    location: { type: String, default: "" },

    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pulseUsr",
      },
    ],

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
export default PostModel; 
