import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  newAccessToken,
} from "../controllers/user.js";
import { verifyRefreshToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/refresh-token", verifyRefreshToken, newAccessToken);

export default router;
