import dotenv from "dotenv";

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000"),

  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME || "factory_monitor",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
} as const;

export const isDevelopment = config.nodeEnv === "development";
export const isProduction = config.nodeEnv === "production";
