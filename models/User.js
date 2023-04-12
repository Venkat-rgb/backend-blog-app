import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "Please enter an email!"],
    },
    password: {
      type: String,
      required: [true, "Please enter a password!"],
      minlength: [6, "Password length should be greater than 6 characters!"],
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
