import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 3000),

  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://notifications:devpass@localhost:54320/notifications",

  redisHost:
    process.env.REDIS_HOST ?? "localhost",

  redisPort:
    Number(process.env.REDIS_PORT ?? 6379),
};