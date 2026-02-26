export interface ProductionLine {
  id: number;
  name: string;
  description: string | null;
  target_cycle_time: number;
  target_units_per_hour: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductionRun {
  id: number;
  line_id: number;
  shift: "morning" | "afternoon" | "night";
  start_time: string;
  end_time: string | null;
  target_quantity: number;
  actual_quantity: number;
  good_quantity: number;
  defect_quantity: number;
  status: "running" | "stopped" | "completed";
  created_at: string;
  updated_at: string;
}

export interface LineStats {
  line: ProductionLine;
  currentRun: ProductionRun;
}

export interface OEEData {
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  totalTime: number;
  downtime: number;
  actualOutput: number;
  targetOutput: number;
  goodOutput: number;
}

export interface DowntimeByCategory {
  category: string;
  count: string;
  total_minutes: string;
}

export interface DowntimeData {
  events: Array<{
    id: number;
    line_id: number;
    run_id: number;
    category: string;
    reason: string;
    start_time: string;
    end_time: string | null;
    duration_minutes: number | null;
    shift?: string;
  }>;
  byCategory: DowntimeByCategory[];
}

export interface QualityData {
  totalProduced: number;
  goodUnits: number;
  defectUnits: number;
  fpy: number;
  defectRate: number;
  defectsByType: Array<{ defect_type: string | null; total_count: string }>;
}

export interface MaintenanceData {
  mtbf: number;
  mttr: number;
  breakdownCount: number;
  totalDowntime: number;
  periodDays: number;
}

export interface OEETrendPoint {
  runId: number;
  startTime: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}
