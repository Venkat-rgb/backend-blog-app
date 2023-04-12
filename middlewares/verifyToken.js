import { RefreshToken } from "../models/RefreshToken.js";
import { User } from "../models/User.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";

export const verifyAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new ErrorHandler("Please Login First!", 401));
    }

    const accessToken = authHeader.split(" ")[1];
    const isTokenValid = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (!isTokenValid) {
      return next(new ErrorHandler("Invalid Token!", 401));
    }

    req.user = await User.findOne({ _id: isTokenValid.id });

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token is Expired!", 401));
    } else {
      return next(new ErrorHandler(err.message, 404));
    }
  }
};

export const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(new ErrorHandler("Please Login First!", 401));
    }

    const getToken = await RefreshToken.findOne({ refreshToken });

    if (!getToken) {
      return next(new ErrorHandler("Invalid Token!", 403));
    }

    const isTokenValid = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!isTokenValid) {
      return next(new ErrorHandler("Invalid Token!", 403));
    }

    req.user = await User.findOne({ _id: isTokenValid.id });

    next();
  } catch (err) {
    return next(new ErrorHandler(err.message, 404));
  }
};
