import app from "./app.js";
import { connectDB } from "./config/db.config.js";
import { connectRedis } from "./config/redis.config.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();       // MongoDB
  await connectRedis();    // Redis

  app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();