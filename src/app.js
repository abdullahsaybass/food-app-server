import "dotenv/config";

import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

import router from "./routers/index.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";
import path from "path";

const app = express();

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Logger
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.json({ success: true, message: "API is running 🚀" });
});

app.use("/api", router);

app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
// ✅ 404
app.use(notFoundHandler);

// ✅ REAL ERROR HANDLER
app.use(errorHandler);

export default app;