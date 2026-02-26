import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { getApiUrl } from "./api/client";
import { Dashboard } from "./pages/Dashboard";
import { LineDetail } from "./pages/LineDetail";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lastUpdate, setLastUpdate] = useState<{
    lineId: number;
    timestamp: string;
    status: string;
    currentCount: number;
  } | null>(null);

  useEffect(() => {
    fetch(getApiUrl("/api/health"))
      .then((res) => res.json())
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false));

    const baseUrl = getApiUrl("");
    const newSocket = io(baseUrl, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => setSocket(newSocket));
    newSocket.on("disconnect", () => setSocket(null));
    newSocket.on("welcome", () => {});
    newSocket.on("production-update", (data) => setLastUpdate(data));

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Factory Monitor Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-400">
                API: {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
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
          {lastUpdate && (
            <div className="mb-6 rounded-lg border border-blue-700 bg-blue-900/30 p-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                Live Production Data
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
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

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lines/:id" element={<LineDetail />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
