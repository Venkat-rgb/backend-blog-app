import express from "express";
import path from "path";
import { config } from "dotenv";
import userRoutes from "./routes/user.js";
import postRoutes from "./routes/post.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

config({
  path: `${path.resolve()}/config/config.env`,
});
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(`${path.resolve()}/uploads`));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL1, process.env.FRONTEND_URL2],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

mongoose
  .connect(`${process.env.MONGODB_URL}`)
  .then((e) => console.log(`Successfully Connected to ${e.connection.host}`))
  .catch((err) => console.log(err));

app.use("/user", userRoutes);
app.use("/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("API is working fine!");
});

app.listen(port, (err) => {
  if (err) {
    console.log(`Server is Unable to listen on port: ${port}`);
    return;
  }
  console.log(`Server is up and running on port: ${port}`);
});

app.use(errorMiddleware);
