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

  /** MQTT broker URL (e.g. mqtt://localhost:1883). If unset, MQTT ingestion is disabled. */
  mqtt: {
    url: process.env.MQTT_URL || "",
    topicPrefix: (process.env.MQTT_TOPIC_PREFIX || "factory").replace(/\/+$/, ""),
  },

  /** Shared secret for POST /api/internal/telemetry. If unset, the HTTP route is disabled. */
  ingestion: {
    token: process.env.INGESTION_TOKEN || "",
  },
} as const;

export const isDevelopment = config.nodeEnv === "development";
export const isProduction = config.nodeEnv === "production";
