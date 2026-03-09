import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { OEEData, DowntimeByCategory, QualityData, MaintenanceData } from "../types/api";

const OEE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
const CATEGORY_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface OEEChartProps {
  data: OEEData;
}

export function OEEChart({ data }: OEEChartProps) {
  const chartData = [
    { name: "OEE", value: data.oee, fill: OEE_COLORS[0] },
    { name: "Availability", value: data.availability, fill: OEE_COLORS[1] },
    { name: "Performance", value: data.performance, fill: OEE_COLORS[2] },
    { name: "Quality", value: data.quality, fill: OEE_COLORS[3] },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
          <YAxis type="category" dataKey="name" stroke="#9ca3af" tick={{ fill: "#9ca3af" }} width={70} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            labelStyle={{ color: "#fff" }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
          />
          <Legend />
          <Bar dataKey="value" name="%" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface DowntimeChartProps {
  byCategory: DowntimeByCategory[];
}

export function DowntimeChart({ byCategory }: DowntimeChartProps) {
  const data = byCategory.map((c, i) => ({
    name: c.category,
    minutes: parseFloat(c.total_minutes),
    count: parseInt(c.count, 10),
    fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No downtime data
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
          <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            formatter={(value: number, _: unknown, props: { payload?: { count: number } }) => [
              `${value} min${props.payload ? ` (${props.payload.count} events)` : ""}`,
              "Downtime",
            ]}
          />
          <Legend />
          <Bar dataKey="minutes" name="Minutes" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface QualityChartProps {
  data: QualityData;
}

export function QualityChart({ data }: QualityChartProps) {
  const defects = data.defectsByType.filter((d) => d.defect_type);
  const chartData = defects.map((d, i) => ({
    name: d.defect_type ?? "Other",
    value: parseInt(d.total_count, 10),
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No defects recorded
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={chartData[index].fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MaintenanceChartProps {
  data: MaintenanceData;
}

export function MaintenanceChart({ data }: MaintenanceChartProps) {
  const chartData = [
    { name: "MTBF (h)", value: data.mtbf, fill: "#10b981" },
    { name: "MTTR (min)", value: data.mttr, fill: "#ef4444" },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
          <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
          />
          <Legend />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
