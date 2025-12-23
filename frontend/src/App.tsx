import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lastUpdate, setLastUpdate] = useState<any>(null);

  useEffect(() => {
    // Test API connection
    fetch("http://localhost:3000/api/health")
      .then((res) => res.json())
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false));

    // Initialize Socket.io
    const newSocket = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
    });

    // Connection events
    newSocket.on("connect", () => {
      console.log("✅ WebSocket connected:", newSocket.id);
      setSocket(newSocket);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
      setSocket(null);
    });

    // Listen to welcome message
    newSocket.on("welcome", (data) => {
      console.log("📨 Welcome message:", data);
    });

    // Listen to production updates
    newSocket.on("production-update", (data) => {
      console.log("📊 Production update:", data);
      setLastUpdate(data);
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Factory Monitor Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-400">
                API: {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  socket ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-400">
                WebSocket: {socket ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </header>

        <main>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              Real-time Manufacturing Operations
            </h2>
            <p className="text-gray-300">
              Built from 15+ years of plant maintenance and operations
              management experience.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700/50 rounded p-4">
                <div className="text-sm text-gray-400 mb-1">Status</div>
                <div className="text-xl font-semibold">System Ready</div>
              </div>
              <div className="bg-gray-700/50 rounded p-4">
                <div className="text-sm text-gray-400 mb-1">
                  Production Lines
                </div>
                <div className="text-xl font-semibold">3 Active</div>
              </div>
              <div className="bg-gray-700/50 rounded p-4">
                <div className="text-sm text-gray-400 mb-1">Monitoring</div>
                <div className="text-xl font-semibold">
                  OEE • Downtime • Quality
                </div>
              </div>
            </div>
          </div>

          {/* Real-time data display */}
          {lastUpdate && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Live Production Data
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Line ID</div>
                  <div className="font-mono text-blue-400">
                    {lastUpdate.lineId}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Status</div>
                  <div className="font-semibold text-green-400">
                    {lastUpdate.status}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Current Count</div>
                  <div className="font-mono text-blue-400">
                    {lastUpdate.currentCount}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Last Update</div>
                  <div className="font-mono text-xs text-gray-400">
                    {new Date(lastUpdate.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
