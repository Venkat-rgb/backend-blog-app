import { ErrorHandler } from "../utils/errorHandler.js";
import { getValidationErrors } from "../utils/getValidationErrors.js";
import { Post } from "../models/Post.js";
import { rename } from "../utils/rename.js";

export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate({
      path: "author",
      select: "username _id",
    });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (err) {
    return next(new ErrorHandler(err.message, 404));
  }
};

export const getPost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    let post = await Post.findById(postId)?.populate({
      path: "author",
      select: "username _id",
    });

    if (!post) throw new Error("Post doesn't exists!");

    res.status(200).json({
      success: true,
      post,
    });
  } catch (err) {
    return next(new ErrorHandler(err.message, 404));
  }
};

export const createPost = async (req, res, next) => {
  const { title, content } = req.body;
  try {
    if (!title?.trim() || !content?.trim()) {
      throw new Error("Please enter all the fields!");
    } else {
      if (!req.file) {
        return next(new ErrorHandler("Please upload an image!", 404));
      }

      const { originalname, filename } = req.file;
      const splittedName = originalname.split(".");

      rename(req.file, splittedName);

      const post = new Post({
        title,
        content,
        author: req.user?._id,
        img: `uploads/${filename}.${splittedName[splittedName.length - 1]}`,
      });

      await post.validate();

      await post.save();

      res.status(200).json({
        success: true,
        message: "Post created successfully!",
      });
    }
  } catch (err) {
    if (err.name === "ValidationError") {
      res.json(err);
      const errors = getValidationErrors(err);
      return next(new ErrorHandler(errors, 404));
    } else {
      return next(new ErrorHandler(err.message, 404));
    }
  }
};

export const updatePost = async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, id } = req.body;

  try {
    if (req.user?._id.toString() === id) {
      if (!title?.trim() || !content?.trim()) {
        throw new Error("Please enter all the fields!");
      } else {
        const splittedName = req.file && req.file.originalname.split(".");
        if (req.file) {
          rename(req.file, splittedName);
        }

        const updatedPost = await Post.findByIdAndUpdate(
          postId,
          {
            title,
            content,
            img:
              req.file &&
              `uploads/${req?.file?.filename}.${
                splittedName[splittedName.length - 1]
              }`,
          },
          {
            new: true,
          }
        );

        if (!updatedPost) throw new Error("Post doesn't exists!");

        res.status(200).json({
          success: true,
          message: "Post updated successfully!",
        });
      }
    } else {
      throw new Error(`User don't have priviledges to update this post!`);
    }
  } catch (err) {
    return next(new ErrorHandler(err.message, 404));
  }
};

export const deletePost = async (req, res, next) => {
  const { postId } = req.params;
  const { id } = req.body;

  try {
    if (req.user?._id.toString() === id) {
      const isDeleted = await Post.findByIdAndDelete(postId);
      if (!isDeleted) throw new Error("Post doesn't exists!");

      res.status(200).json({
        success: true,
        message: "Post deleted successfully!",
      });
    } else {
      throw new Error(`User don't have priviledges to delete this post!`);
    }
  } catch (err) {
    return next(new ErrorHandler(err.message, 404));
  }
};
