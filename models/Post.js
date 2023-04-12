import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter a title!"],
    },
    content: {
      type: String,
      required: [true, "Please enter a content!"],
    },
    img: {
      type: String,
      required: [true, "Please enter a image!"],
    },
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: [true, "Please enter author!"],
    },
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.model("Post", postSchema);
