import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required("DATABASE_URL"),
  redisHost: process.env.REDIS_HOST ?? "localhost",
  redisPort: Number(process.env.REDIS_PORT ?? 6379),
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ? required("TWILIO_ACCOUNT_SID") : "mock_sid",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ? required("TWILIO_AUTH_TOKEN") : "mock_token",
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER ? required("TWILIO_PHONE_NUMBER") : "mock_number",
};