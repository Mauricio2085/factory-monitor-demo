import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import type { ApiResponse, ProductionLine } from "../types/api";

export function Dashboard() {
  const [lines, setLines] = useState<ProductionLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ApiResponse<ProductionLine[]>>("/lines")
      .then((res) => {
        setLines(res.data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load lines");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-gray-400">Loading lines…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-300">
        {error}
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800 p-6">
        <h2 className="mb-4 text-2xl font-semibold">
          Real-time Manufacturing Operations
        </h2>
        <p className="text-gray-300">
          Built from 15+ years of plant maintenance and operations management
          experience.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded bg-gray-700/50 p-4">
            <div className="mb-1 text-sm text-gray-400">Status</div>
            <div className="text-xl font-semibold">System Ready</div>
          </div>
          <div className="rounded bg-gray-700/50 p-4">
            <div className="mb-1 text-sm text-gray-400">Production Lines</div>
            <div className="text-xl font-semibold">{lines.length} Active</div>
          </div>
          <div className="rounded bg-gray-700/50 p-4">
            <div className="mb-1 text-sm text-gray-400">Monitoring</div>
            <div className="text-xl font-semibold">
              OEE • Downtime • Quality
            </div>
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-semibold">Production Lines</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lines.map((line) => (
          <Link
            key={line.id}
            to={`/lines/${line.id}`}
            className="block rounded-lg border border-gray-700 bg-gray-800 p-5 transition hover:border-gray-600 hover:bg-gray-700/80"
          >
            <h3 className="text-lg font-semibold text-white">{line.name}</h3>
            {line.description && (
              <p className="mt-1 text-sm text-gray-400">{line.description}</p>
            )}
            <div className="mt-3 flex items-center text-sm text-blue-400">
              View metrics →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
