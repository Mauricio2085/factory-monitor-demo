import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api/client";
import type {
  ApiResponse,
  LineStats,
  OEEData,
  DowntimeData,
  QualityData,
  MaintenanceData,
} from "../types/api";
import {
  OEEChart,
  DowntimeChart,
  QualityChart,
  MaintenanceChart,
} from "../components/LineCharts";

export function LineDetail() {
  const { id } = useParams<{ id: string }>();
  const [stats, setStats] = useState<LineStats | null>(null);
  const [oee, setOee] = useState<OEEData | null>(null);
  const [downtime, setDowntime] = useState<DowntimeData | null>(null);
  const [quality, setQuality] = useState<QualityData | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const lineId = parseInt(id, 10);
    if (isNaN(lineId)) {
      setError("Invalid line ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    apiFetch<ApiResponse<LineStats>>(`lines/${id}/stats`)
      .then((res) => {
        setStats(res.data);
        const { currentRun } = res.data;

        const promises: Promise<unknown>[] = [
          apiFetch<ApiResponse<DowntimeData>>(`metrics/${id}/downtime?limit=20`).then(
            (r) => setDowntime(r.data)
          ),
          apiFetch<ApiResponse<MaintenanceData>>(
            `metrics/${id}/maintenance?days=7`
          ).then((r) => setMaintenance(r.data)),
        ];

        if (currentRun) {
          promises.push(
            apiFetch<ApiResponse<OEEData>>(
              `metrics/${id}/oee?runId=${currentRun.id}`
            ).then((r) => setOee(r.data))
          );
          promises.push(
            apiFetch<ApiResponse<QualityData>>(
              `metrics/${id}/quality?runId=${currentRun.id}`
            ).then((r) => setQuality(r.data))
          );
        }

        return Promise.all(promises);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load line");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <section>
        <Link
          to="/"
          className="mb-4 inline-block text-sm text-gray-400 hover:text-white"
        >
          ← Back to dashboard
        </Link>
        <div className="flex items-center justify-center py-12">
          <span className="text-gray-400">Loading…</span>
        </div>
      </section>
    );
  }

  if (error || !stats) {
    return (
      <section>
        <Link
          to="/"
          className="mb-4 inline-block text-sm text-gray-400 hover:text-white"
        >
          ← Back to dashboard
        </Link>
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-300">
          {error ?? "Line not found"}
        </div>
      </section>
    );
  }

  const { line, currentRun } = stats;

  return (
    <section>
      <Link
        to="/"
        className="mb-4 inline-block text-sm text-gray-400 hover:text-white"
      >
        ← Back to dashboard
      </Link>

      <h2 className="mb-6 text-2xl font-semibold">{line.name}</h2>

      {!currentRun && (
        <div className="mb-6 rounded-lg border border-amber-700 bg-amber-900/20 p-4 text-amber-200">
          No active run. OEE and Quality metrics require an active production run.
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {oee && (
          <>
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <div className="text-sm text-gray-400">OEE</div>
              <div className="text-2xl font-bold text-blue-400">{oee.oee}%</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <div className="text-sm text-gray-400">Availability</div>
              <div className="text-2xl font-bold">{oee.availability}%</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <div className="text-sm text-gray-400">Performance</div>
              <div className="text-2xl font-bold">{oee.performance}%</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <div className="text-sm text-gray-400">Quality</div>
              <div className="text-2xl font-bold">{oee.quality}%</div>
            </div>
          </>
        )}
        {quality && (
          <>
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <div className="text-sm text-gray-400">FPY</div>
              <div className="text-2xl font-bold">{quality.fpy}%</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <div className="text-sm text-gray-400">Good / Total</div>
              <div className="text-2xl font-bold">
                {quality.goodUnits} / {quality.totalProduced}
              </div>
            </div>
          </>
        )}
        {maintenance && (
          <>
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <div className="text-sm text-gray-400">MTBF (h)</div>
              <div className="text-2xl font-bold">{maintenance.mtbf}</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <div className="text-sm text-gray-400">MTTR (min)</div>
              <div className="text-2xl font-bold">{maintenance.mttr}</div>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {oee && (
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-semibold">OEE Components</h3>
            <OEEChart data={oee} />
          </div>
        )}

        {downtime && (
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-semibold">Downtime by Category</h3>
            <DowntimeChart byCategory={downtime.byCategory} />
          </div>
        )}

        {quality && (
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-semibold">Defects by Type</h3>
            <QualityChart data={quality} />
          </div>
        )}

        {maintenance && (
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-semibold">Maintenance (last 7 days)</h3>
            <MaintenanceChart data={maintenance} />
          </div>
        )}
      </div>
    </section>
  );
}
