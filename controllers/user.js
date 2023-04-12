import { User } from "../models/User.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getValidationErrors } from "../utils/getValidationErrors.js";
import { RefreshToken } from "../models/RefreshToken.js";

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (email.trim() !== "" && password.trim() !== "") {
      const isUserExists = await User.findOne({ email });

      if (!isUserExists) {
        throw new Error("User does not exists, Please register first!");
      }

      const isPasswordMatched = await bcrypt.compare(
        password,
        isUserExists.password
      );

      if (!isPasswordMatched) {
        throw new Error("Invalid Password!");
      }

      const accessToken = jwt.sign(
        { id: isUserExists._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { id: isUserExists._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "3d" }
      );

      await RefreshToken.create({ refreshToken });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
      });

      res.status(200).json({
        success: true,
        accessToken,
        user: {
          id: isUserExists._id,
          username: isUserExists.username,
          email: isUserExists.email,
        },
        message: `Welcome ${isUserExists.username}`,
      });
    } else {
      throw new Error("Please fill all the fields!");
    }
  } catch (err) {
    return next(new ErrorHandler(err.message, 404));
  }
};

export const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    if (
      username.trim() !== "" &&
      email.trim() !== "" &&
      password.trim() !== ""
    ) {
      if (!email.includes("@gmail.com")) {
        throw new Error("Please enter a valid email!");
      }

      let user = new User({ username, email, password });

      const isUserExists = await User.findOne({ username, email });
      if (isUserExists) {
        return next(new ErrorHandler("User already exists!"), 404);
      }

      await user.validate();

      const hashedPassword = await bcrypt.hash(password, 10);

      user = new User({ username, email, password: hashedPassword });
      await user.save();

      res.status(201).json({
        success: true,
        message: "User created successfully!",
      });
    } else {
      return next(new ErrorHandler("Please fill all the fields!", 404));
    }
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "MongoServerError") {
      const errors = getValidationErrors(err);
      return next(new ErrorHandler(errors, 404));
    } else {
      return next(new ErrorHandler(`${err.message}`, 404));
    }
  }
};

export const newAccessToken = async (req, res, next) => {
  try {
    const newToken = jwt.sign(
      { id: req.user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
      },
      accessToken: newToken,
    });
  } catch (err) {
    return next(new ErrorHandler(err.message, 404));
  }
};

export const logoutUser = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  try {
    await RefreshToken.deleteOne({ refreshToken });

    return res
      .status(200)
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .json({
        success: true,
        message: "User logged out successfully!",
      });
  } catch (err) {
    return next(new ErrorHandler(err.message, 404));
  }
};
