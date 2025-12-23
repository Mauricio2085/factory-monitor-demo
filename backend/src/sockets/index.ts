import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Test event
    socket.emit("welcome", {
      message: "Connected to Factory Monitor WebSocket",
      timestamp: new Date().toISOString(),
    });
  });

  // Simulate real-time data (we'll expand this later)
  setInterval(() => {
    io.emit("production-update", {
      lineId: 1,
      timestamp: new Date().toISOString(),
      status: "running",
      currentCount: Math.floor(Math.random() * 1000),
    });
  }, 5000);

  return io;
};
