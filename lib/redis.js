import { config } from "dotenv";
import { Redis } from "@upstash/redis";

// Load environment variables from .env file
config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;

// await redis.set("foo","bar");
