import express from "express";
import {
  createPost,
  updatePost,
  getPosts,
  getPost,
  deletePost,
} from "../controllers/post.js";
import { verifyAccessToken } from "../middlewares/verifyToken.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.get("/", getPosts);
router.post("/new", verifyAccessToken, upload.single("img"), createPost);
router
  .route("/post/:postId")
  .get(verifyAccessToken, getPost)
  .patch(verifyAccessToken, upload.single("img"), updatePost)
  .delete(verifyAccessToken, deletePost);

export default router;
