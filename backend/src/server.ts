import { createServer } from "http";
import app from "./app.js";
import { config } from "./config/env.js";
import { initializeSocket } from "./sockets/index.js";
import pool from "./config/database.js";

const httpServer = createServer(app);

// Initialize Socket.io
const io = initializeSocket(httpServer);

const PORT = config.port;

const startServer = async () => {
  try {
    // Test database connection
    await pool.query("SELECT NOW()");
    console.log("✅ Database connection established");

    httpServer.listen(PORT, () => {
      console.log("");
      console.log("🏭 Factory Monitor Backend");
      console.log("================================");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔌 WebSocket ready`);
      console.log(`🌐 CORS origin: ${config.cors.origin}`);
      console.log("================================");
      console.log("");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing server...");
  httpServer.close(async () => {
    await pool.end();
    console.log("Server closed");
    process.exit(0);
  });
});

startServer();
