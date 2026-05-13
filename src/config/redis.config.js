import { createClient } from "redis";
import { ENV } from "./env.js";

export const redisClient = createClient({
  socket: {
    host: ENV.REDIS.HOST,
    port: ENV.REDIS.PORT,
  },
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis connected");
  } catch (error) {
    console.error("❌ Redis connection failed:", error);
    process.exit(1);
  }
};